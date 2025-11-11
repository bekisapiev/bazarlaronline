"""
Report Endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, func
from typing import Optional
from uuid import UUID
from datetime import datetime

from app.database.session import get_db
from app.models.report import Report, ReportType, ReportReason, ReportStatus
from app.models.user import User
from app.models.product import Product
from app.models.review import Review
from app.core.dependencies import get_current_active_user
from pydantic import BaseModel, Field

router = APIRouter()


# Schemas
class ReportCreate(BaseModel):
    """Report creation schema"""
    report_type: str = Field(..., description="Type: product, seller, review, user")
    reported_product_id: Optional[str] = None
    reported_seller_id: Optional[str] = None
    reported_review_id: Optional[str] = None
    reported_user_id: Optional[str] = None
    reason: str = Field(..., description="Reason: spam, inappropriate, fraud, fake, copyright, offensive, other")
    description: str = Field(..., min_length=10, max_length=1000)


class ReportResponse(BaseModel):
    """Report response schema"""
    id: str
    report_type: str
    reason: str
    description: str
    status: str
    created_at: datetime
    reporter_id: str
    reported_product_id: Optional[str]
    reported_seller_id: Optional[str]
    reported_review_id: Optional[str]
    reported_user_id: Optional[str]


# Helper to check admin access
async def check_admin_access(current_user: User = Depends(get_current_active_user)):
    """Dependency to check if user is admin"""
    if current_user.role not in ["admin", "moderator"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin or moderator access required"
        )
    return current_user


@router.post("/", response_model=ReportResponse)
async def create_report(
    report_data: ReportCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new report

    Users can report products, sellers, reviews, or other users
    """
    # Validate report type
    try:
        report_type = ReportType(report_data.report_type)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid report type: {report_data.report_type}"
        )

    # Validate reason
    try:
        reason = ReportReason(report_data.reason)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid reason: {report_data.reason}"
        )

    # Validate that the correct ID is provided based on type
    if report_type == ReportType.PRODUCT and not report_data.reported_product_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="reported_product_id is required for product reports"
        )
    elif report_type == ReportType.SELLER and not report_data.reported_seller_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="reported_seller_id is required for seller reports"
        )
    elif report_type == ReportType.REVIEW and not report_data.reported_review_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="reported_review_id is required for review reports"
        )
    elif report_type == ReportType.USER and not report_data.reported_user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="reported_user_id is required for user reports"
        )

    # Verify that the reported entity exists
    if report_type == ReportType.PRODUCT:
        product_result = await db.execute(
            select(Product).where(Product.id == UUID(report_data.reported_product_id))
        )
        if not product_result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )

    elif report_type == ReportType.SELLER:
        seller_result = await db.execute(
            select(User).where(User.id == UUID(report_data.reported_seller_id))
        )
        if not seller_result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Seller not found"
            )

    elif report_type == ReportType.REVIEW:
        review_result = await db.execute(
            select(Review).where(Review.id == UUID(report_data.reported_review_id))
        )
        if not review_result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Review not found"
            )

    elif report_type == ReportType.USER:
        user_result = await db.execute(
            select(User).where(User.id == UUID(report_data.reported_user_id))
        )
        if not user_result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

    # Create report
    report = Report(
        reporter_id=current_user.id,
        report_type=report_type,
        reported_product_id=UUID(report_data.reported_product_id) if report_data.reported_product_id else None,
        reported_seller_id=UUID(report_data.reported_seller_id) if report_data.reported_seller_id else None,
        reported_review_id=UUID(report_data.reported_review_id) if report_data.reported_review_id else None,
        reported_user_id=UUID(report_data.reported_user_id) if report_data.reported_user_id else None,
        reason=reason,
        description=report_data.description,
        status=ReportStatus.PENDING
    )

    db.add(report)
    await db.commit()
    await db.refresh(report)

    return ReportResponse(
        id=str(report.id),
        report_type=report.report_type.value,
        reason=report.reason.value,
        description=report.description,
        status=report.status.value,
        created_at=report.created_at,
        reporter_id=str(report.reporter_id),
        reported_product_id=str(report.reported_product_id) if report.reported_product_id else None,
        reported_seller_id=str(report.reported_seller_id) if report.reported_seller_id else None,
        reported_review_id=str(report.reported_review_id) if report.reported_review_id else None,
        reported_user_id=str(report.reported_user_id) if report.reported_user_id else None
    )


@router.get("/my-reports")
async def get_my_reports(
    limit: int = Query(30, le=100),
    offset: int = 0,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get reports created by current user
    """
    result = await db.execute(
        select(Report)
        .where(Report.reporter_id == current_user.id)
        .order_by(desc(Report.created_at))
        .limit(limit)
        .offset(offset)
    )
    reports = result.scalars().all()

    # Count total
    count_result = await db.execute(
        select(func.count())
        .select_from(Report)
        .where(Report.reporter_id == current_user.id)
    )
    total = count_result.scalar()

    return {
        "items": [
            {
                "id": str(r.id),
                "report_type": r.report_type.value,
                "reason": r.reason.value,
                "description": r.description,
                "status": r.status.value,
                "created_at": r.created_at,
                "updated_at": r.updated_at
            }
            for r in reports
        ],
        "total": total,
        "limit": limit,
        "offset": offset,
        "has_more": (offset + limit) < total
    }


@router.get("/admin/pending")
async def get_pending_reports(
    limit: int = Query(30, le=100),
    offset: int = 0,
    report_type: Optional[str] = Query(None, description="Filter by report type"),
    admin_user: User = Depends(check_admin_access),
    db: AsyncSession = Depends(get_db)
):
    """
    Get pending reports (admin/moderator only)
    """
    query = select(Report).where(Report.status == ReportStatus.PENDING)

    if report_type:
        try:
            rt = ReportType(report_type)
            query = query.where(Report.report_type == rt)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid report type: {report_type}"
            )

    query = query.order_by(desc(Report.created_at))

    # Count total
    count_query = select(func.count()).select_from(Report).where(
        Report.status == ReportStatus.PENDING
    )
    if report_type:
        count_query = count_query.where(Report.report_type == rt)

    count_result = await db.execute(count_query)
    total = count_result.scalar()

    # Pagination
    query = query.limit(limit).offset(offset)

    result = await db.execute(query)
    reports = result.scalars().all()

    return {
        "items": [
            {
                "id": str(r.id),
                "reporter_id": str(r.reporter_id),
                "report_type": r.report_type.value,
                "reported_product_id": str(r.reported_product_id) if r.reported_product_id else None,
                "reported_seller_id": str(r.reported_seller_id) if r.reported_seller_id else None,
                "reported_review_id": str(r.reported_review_id) if r.reported_review_id else None,
                "reported_user_id": str(r.reported_user_id) if r.reported_user_id else None,
                "reason": r.reason.value,
                "description": r.description,
                "status": r.status.value,
                "created_at": r.created_at
            }
            for r in reports
        ],
        "total": total,
        "limit": limit,
        "offset": offset,
        "has_more": (offset + limit) < total
    }


@router.put("/admin/{report_id}/review")
async def review_report(
    report_id: UUID,
    new_status: str = Query(..., description="Status: reviewed, resolved, dismissed"),
    admin_notes: Optional[str] = Query(None, description="Admin notes"),
    admin_user: User = Depends(check_admin_access),
    db: AsyncSession = Depends(get_db)
):
    """
    Review a report (admin/moderator only)

    Update report status and add admin notes
    """
    # Validate status
    if new_status not in ["reviewed", "resolved", "dismissed"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Status must be 'reviewed', 'resolved', or 'dismissed'"
        )

    result = await db.execute(
        select(Report).where(Report.id == report_id)
    )
    report = result.scalar_one_or_none()

    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )

    # Update report
    report.status = ReportStatus(new_status)
    report.reviewed_by = admin_user.id
    report.reviewed_at = datetime.utcnow()
    if admin_notes:
        report.admin_notes = admin_notes
    report.updated_at = datetime.utcnow()

    await db.commit()

    return {
        "message": f"Report {new_status} successfully",
        "report_id": str(report_id),
        "status": new_status
    }


@router.get("/admin/stats")
async def get_report_stats(
    admin_user: User = Depends(check_admin_access),
    db: AsyncSession = Depends(get_db)
):
    """
    Get report statistics (admin/moderator only)

    Returns counts by status and type
    """
    # Count by status
    pending_result = await db.execute(
        select(func.count())
        .select_from(Report)
        .where(Report.status == ReportStatus.PENDING)
    )
    pending = pending_result.scalar() or 0

    reviewed_result = await db.execute(
        select(func.count())
        .select_from(Report)
        .where(Report.status == ReportStatus.REVIEWED)
    )
    reviewed = reviewed_result.scalar() or 0

    resolved_result = await db.execute(
        select(func.count())
        .select_from(Report)
        .where(Report.status == ReportStatus.RESOLVED)
    )
    resolved = resolved_result.scalar() or 0

    dismissed_result = await db.execute(
        select(func.count())
        .select_from(Report)
        .where(Report.status == ReportStatus.DISMISSED)
    )
    dismissed = dismissed_result.scalar() or 0

    # Count by type
    type_counts = {}
    for report_type in ReportType:
        type_result = await db.execute(
            select(func.count())
            .select_from(Report)
            .where(Report.report_type == report_type)
        )
        type_counts[report_type.value] = type_result.scalar() or 0

    return {
        "by_status": {
            "pending": pending,
            "reviewed": reviewed,
            "resolved": resolved,
            "dismissed": dismissed,
            "total": pending + reviewed + resolved + dismissed
        },
        "by_type": type_counts
    }
