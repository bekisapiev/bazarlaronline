"""
File Upload Endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from typing import List
import os
import uuid
from pathlib import Path
import aiofiles

from app.core.config import settings
from app.models.user import User
from app.core.dependencies import get_current_active_user

router = APIRouter()


def validate_image(file: UploadFile) -> None:
    """Validate uploaded image file"""
    # Check content type
    if file.content_type not in settings.ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Allowed types: {', '.join(settings.ALLOWED_IMAGE_TYPES)}"
        )


async def save_upload_file(upload_file: UploadFile, destination: Path) -> None:
    """Save uploaded file to destination"""
    async with aiofiles.open(destination, 'wb') as out_file:
        content = await upload_file.read()
        await out_file.write(content)


@router.post("/image")
async def upload_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
):
    """
    Upload a single image

    Returns the URL to access the uploaded image
    """
    # Validate image
    validate_image(file)

    # Check file size
    content = await file.read()
    if len(content) > settings.MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File size exceeds maximum allowed size of {settings.MAX_FILE_SIZE / 1024 / 1024}MB"
        )

    # Reset file pointer
    await file.seek(0)

    # Generate unique filename
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"

    # Create upload directory if it doesn't exist
    upload_dir = Path(settings.UPLOAD_DIR)
    upload_dir.mkdir(parents=True, exist_ok=True)

    # Save file
    file_path = upload_dir / unique_filename
    await save_upload_file(file, file_path)

    # Return URL
    file_url = f"{settings.API_URL}/uploads/{unique_filename}"

    return {
        "url": file_url,
        "filename": unique_filename
    }


@router.post("/images")
async def upload_images(
    files: List[UploadFile] = File(...),
    current_user: User = Depends(get_current_active_user),
):
    """
    Upload multiple images (max 10)

    Returns list of URLs to access the uploaded images
    """
    if len(files) > 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum 10 images allowed per upload"
        )

    uploaded_files = []

    for file in files:
        # Validate image
        validate_image(file)

        # Check file size
        content = await file.read()
        if len(content) > settings.MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File {file.filename} exceeds maximum allowed size of {settings.MAX_FILE_SIZE / 1024 / 1024}MB"
            )

        # Reset file pointer
        await file.seek(0)

        # Generate unique filename
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"

        # Create upload directory if it doesn't exist
        upload_dir = Path(settings.UPLOAD_DIR)
        upload_dir.mkdir(parents=True, exist_ok=True)

        # Save file
        file_path = upload_dir / unique_filename
        await save_upload_file(file, file_path)

        # Add to list
        file_url = f"{settings.API_URL}/uploads/{unique_filename}"
        uploaded_files.append({
            "url": file_url,
            "filename": unique_filename
        })

    return {
        "files": uploaded_files,
        "count": len(uploaded_files)
    }


@router.delete("/image/{filename}")
async def delete_image(
    filename: str,
    current_user: User = Depends(get_current_active_user),
):
    """
    Delete an uploaded image

    Only the uploader or admin can delete files
    """
    # Security: validate filename to prevent path traversal
    if "/" in filename or ".." in filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid filename"
        )

    file_path = Path(settings.UPLOAD_DIR) / filename

    if not file_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )

    # Delete file
    file_path.unlink()

    return {
        "message": "File deleted successfully",
        "filename": filename
    }
