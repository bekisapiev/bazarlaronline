"""
Category Endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import Optional

from app.database.session import get_db
from app.models.product import Category
from app.models.user import User
from app.core.dependencies import get_current_active_user
from pydantic import BaseModel, Field

router = APIRouter()


# Schemas
class CategoryCreate(BaseModel):
    """Category creation schema"""
    parent_id: Optional[int] = Field(None, description="Parent category ID (null for root)")
    name: str = Field(..., min_length=1, max_length=100)
    slug: str = Field(..., min_length=1, max_length=100, pattern="^[a-z0-9-]+$")
    level: int = Field(..., ge=1, le=3, description="Category level (1-3)")
    icon: Optional[str] = Field(None, max_length=100)
    sort_order: int = Field(0, description="Sort order")
    is_active: bool = Field(True)


class CategoryUpdate(BaseModel):
    """Category update schema"""
    parent_id: Optional[int] = None
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    slug: Optional[str] = Field(None, min_length=1, max_length=100, pattern="^[a-z0-9-]+$")
    level: Optional[int] = Field(None, ge=1, le=3)
    icon: Optional[str] = Field(None, max_length=100)
    sort_order: Optional[int] = None
    is_active: Optional[bool] = None


class CategoryResponse(BaseModel):
    """Category response schema"""
    id: int
    parent_id: Optional[int]
    name: str
    slug: str
    level: int
    icon: Optional[str]
    sort_order: int
    is_active: bool


# Helper to check admin access
async def check_admin_access(current_user: User = Depends(get_current_active_user)):
    """Dependency to check if user is admin"""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user


@router.get("/")
async def get_categories(
    level: Optional[int] = Query(None, ge=1, le=3, description="Filter by level"),
    parent_id: Optional[int] = Query(None, description="Filter by parent category"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    db: AsyncSession = Depends(get_db)
):
    """
    Get all categories with optional filters

    Public endpoint - no authentication required
    """
    query = select(Category)

    # Apply filters
    if level is not None:
        query = query.where(Category.level == level)

    if parent_id is not None:
        query = query.where(Category.parent_id == parent_id)

    if is_active is not None:
        query = query.where(Category.is_active == is_active)
    else:
        # By default, show only active categories
        query = query.where(Category.is_active == True)

    # Sort by sort_order, then by name
    query = query.order_by(Category.sort_order, Category.name)

    result = await db.execute(query)
    categories = result.scalars().all()

    return {
        "items": [
            {
                "id": c.id,
                "parent_id": c.parent_id,
                "name": c.name,
                "slug": c.slug,
                "level": c.level,
                "icon": c.icon,
                "sort_order": c.sort_order,
                "is_active": c.is_active
            }
            for c in categories
        ],
        "total": len(categories)
    }


@router.get("/tree")
async def get_categories_tree(
    db: AsyncSession = Depends(get_db)
):
    """
    Get categories as hierarchical tree structure

    Returns root categories with nested children up to 3 levels
    Public endpoint - no authentication required
    """
    # Get all active categories
    result = await db.execute(
        select(Category)
        .where(Category.is_active == True)
        .order_by(Category.level, Category.sort_order, Category.name)
    )
    all_categories = result.scalars().all()

    # Build tree structure using dictionary for O(1) lookup
    categories_dict = {}

    # First pass: create dictionary entries for all categories
    for category in all_categories:
        categories_dict[category.id] = {
            "id": category.id,
            "parent_id": category.parent_id,
            "name": category.name,
            "slug": category.slug,
            "level": category.level,
            "icon": category.icon,
            "sort_order": category.sort_order,
            "children": []
        }

    # Second pass: build tree structure
    tree = []
    for category in all_categories:
        cat_dict = categories_dict[category.id]

        if category.parent_id is None:
            # Root category
            tree.append(cat_dict)
        else:
            # Add to parent's children
            parent = categories_dict.get(category.parent_id)
            if parent:
                parent["children"].append(cat_dict)

    return {"tree": tree}


@router.get("/{category_id}")
async def get_category(
    category_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Get category by ID

    Public endpoint - no authentication required
    """
    result = await db.execute(
        select(Category).where(Category.id == category_id)
    )
    category = result.scalar_one_or_none()

    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )

    return {
        "id": category.id,
        "parent_id": category.parent_id,
        "name": category.name,
        "slug": category.slug,
        "level": category.level,
        "icon": category.icon,
        "sort_order": category.sort_order,
        "is_active": category.is_active
    }


@router.post("/", response_model=CategoryResponse)
async def create_category(
    category_data: CategoryCreate,
    admin_user: User = Depends(check_admin_access),
    db: AsyncSession = Depends(get_db)
):
    """
    Create new category (admin only)
    """
    # Check if slug already exists
    slug_check = await db.execute(
        select(Category).where(Category.slug == category_data.slug)
    )
    if slug_check.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Category with slug '{category_data.slug}' already exists"
        )

    # Verify parent exists if parent_id is provided
    if category_data.parent_id:
        parent_result = await db.execute(
            select(Category).where(Category.id == category_data.parent_id)
        )
        parent = parent_result.scalar_one_or_none()
        if not parent:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Parent category not found"
            )

        # Validate level hierarchy
        if category_data.level != parent.level + 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Child category must be one level below parent (parent level: {parent.level})"
            )

    # Create category
    category = Category(
        parent_id=category_data.parent_id,
        name=category_data.name,
        slug=category_data.slug,
        level=category_data.level,
        icon=category_data.icon,
        sort_order=category_data.sort_order,
        is_active=category_data.is_active
    )

    db.add(category)
    await db.commit()
    await db.refresh(category)

    return CategoryResponse(
        id=category.id,
        parent_id=category.parent_id,
        name=category.name,
        slug=category.slug,
        level=category.level,
        icon=category.icon,
        sort_order=category.sort_order,
        is_active=category.is_active
    )


@router.put("/{category_id}", response_model=CategoryResponse)
async def update_category(
    category_id: int,
    category_data: CategoryUpdate,
    admin_user: User = Depends(check_admin_access),
    db: AsyncSession = Depends(get_db)
):
    """
    Update category (admin only)
    """
    result = await db.execute(
        select(Category).where(Category.id == category_id)
    )
    category = result.scalar_one_or_none()

    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )

    # Check if slug is being changed and if it already exists
    if category_data.slug and category_data.slug != category.slug:
        slug_check = await db.execute(
            select(Category).where(Category.slug == category_data.slug)
        )
        if slug_check.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Category with slug '{category_data.slug}' already exists"
            )

    # Update fields
    if category_data.parent_id is not None:
        # Verify parent exists
        if category_data.parent_id:
            parent_result = await db.execute(
                select(Category).where(Category.id == category_data.parent_id)
            )
            parent = parent_result.scalar_one_or_none()
            if not parent:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Parent category not found"
                )
        category.parent_id = category_data.parent_id

    if category_data.name:
        category.name = category_data.name

    if category_data.slug:
        category.slug = category_data.slug

    if category_data.level is not None:
        category.level = category_data.level

    if category_data.icon is not None:
        category.icon = category_data.icon

    if category_data.sort_order is not None:
        category.sort_order = category_data.sort_order

    if category_data.is_active is not None:
        category.is_active = category_data.is_active

    await db.commit()
    await db.refresh(category)

    return CategoryResponse(
        id=category.id,
        parent_id=category.parent_id,
        name=category.name,
        slug=category.slug,
        level=category.level,
        icon=category.icon,
        sort_order=category.sort_order,
        is_active=category.is_active
    )


@router.delete("/{category_id}")
async def delete_category(
    category_id: int,
    admin_user: User = Depends(check_admin_access),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete category (admin only)

    Soft delete - marks as inactive instead of removing from database
    """
    result = await db.execute(
        select(Category).where(Category.id == category_id)
    )
    category = result.scalar_one_or_none()

    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )

    # Check if category has active children
    children_result = await db.execute(
        select(Category).where(
            Category.parent_id == category_id,
            Category.is_active == True
        )
    )
    if children_result.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete category with active children. Deactivate children first."
        )

    # Soft delete - mark as inactive
    category.is_active = False
    await db.commit()

    return {
        "message": "Category deactivated successfully",
        "category_id": category_id
    }
