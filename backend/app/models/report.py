"""
Report Model
"""
from sqlalchemy import Column, String, DateTime, Text, ForeignKey, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum

from app.database.base import Base


class ReportStatus(str, enum.Enum):
    """Report status enum"""
    PENDING = "pending"
    REVIEWED = "reviewed"
    RESOLVED = "resolved"
    DISMISSED = "dismissed"


class ReportType(str, enum.Enum):
    """Report type enum"""
    PRODUCT = "product"
    SELLER = "seller"
    REVIEW = "review"
    USER = "user"
    ORDER = "order"


class ReportReason(str, enum.Enum):
    """Report reason enum"""
    SPAM = "spam"
    INAPPROPRIATE = "inappropriate"
    FRAUD = "fraud"
    FAKE = "fake"
    COPYRIGHT = "copyright"
    OFFENSIVE = "offensive"
    OTHER = "other"


class Report(Base):
    """Report model for user complaints"""
    __tablename__ = "reports"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    reporter_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    # What is being reported
    report_type = Column(SQLEnum(ReportType, name="report_type_enum", values_callable=lambda x: [e.value for e in x]), nullable=False)
    reported_product_id = Column(UUID(as_uuid=True), ForeignKey("products.id", ondelete="CASCADE"), nullable=True)
    reported_seller_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    reported_review_id = Column(UUID(as_uuid=True), ForeignKey("reviews.id", ondelete="CASCADE"), nullable=True)
    reported_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    reported_order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id", ondelete="CASCADE"), nullable=True)

    # Reporter contact info (editable by user)
    reporter_phone = Column(String(20), nullable=True)
    reporter_email = Column(String(255), nullable=True)

    # Report details
    reason = Column(SQLEnum(ReportReason, name="report_reason_enum", values_callable=lambda x: [e.value for e in x]), nullable=False)
    description = Column(Text, nullable=False)
    status = Column(SQLEnum(ReportStatus, name="report_status_enum", values_callable=lambda x: [e.value for e in x]), default=ReportStatus.PENDING)

    # Admin handling
    reviewed_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    admin_notes = Column(Text, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    reporter = relationship("User", foreign_keys=[reporter_id], backref="reports_made")
    reviewed_by_admin = relationship("User", foreign_keys=[reviewed_by])
    reported_product = relationship("Product", foreign_keys=[reported_product_id])
    reported_seller = relationship("User", foreign_keys=[reported_seller_id])
    reported_review = relationship("Review", foreign_keys=[reported_review_id])
    reported_user = relationship("User", foreign_keys=[reported_user_id])
    reported_order = relationship("Order", foreign_keys=[reported_order_id])

    def __repr__(self):
        return f"<Report {self.report_type} by {self.reporter_id}>"
