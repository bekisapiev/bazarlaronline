"""
Data Export Endpoints for Sellers
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, and_
from typing import Optional
from datetime import datetime, timedelta
from io import StringIO
import csv

from app.database.session import get_db
from app.models.user import User
from app.models.order import Order
from app.models.product import Product
from app.core.dependencies import get_current_active_user

router = APIRouter()


async def verify_seller_access(current_user: User):
    """Verify user has seller access"""
    if current_user.role not in ["seller", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Seller access required"
        )
    return current_user


@router.get("/orders/csv")
async def export_orders_csv(
    period: str = Query("month", description="Period: week, month, quarter, year, all"),
    status_filter: Optional[str] = Query(None, description="Filter by status"),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Export seller orders to CSV

    Returns CSV file with order data for specified period
    """
    await verify_seller_access(current_user)

    # Calculate date range
    now = datetime.utcnow()
    if period == "week":
        start_date = now - timedelta(weeks=1)
    elif period == "month":
        start_date = now - timedelta(days=30)
    elif period == "quarter":
        start_date = now - timedelta(days=90)
    elif period == "year":
        start_date = now - timedelta(days=365)
    else:  # all
        start_date = datetime(2000, 1, 1)

    # Build query
    query = select(Order).where(
        and_(
            Order.seller_id == current_user.id,
            Order.created_at >= start_date
        )
    )

    if status_filter:
        query = query.where(Order.status == status_filter)

    query = query.order_by(desc(Order.created_at))

    result = await db.execute(query)
    orders = result.scalars().all()

    # Create CSV
    output = StringIO()
    writer = csv.writer(output)

    # Write header
    writer.writerow([
        'Order Number',
        'Buyer Email',
        'Product ID',
        'Total Amount (KGS)',
        'Status',
        'Payment Method',
        'Delivery Type',
        'Delivery Address',
        'Created At',
        'Updated At'
    ])

    # Write data
    for order in orders:
        # Get buyer info
        buyer_result = await db.execute(
            select(User).where(User.id == order.buyer_id)
        )
        buyer = buyer_result.scalar_one_or_none()

        writer.writerow([
            order.order_number,
            buyer.email if buyer else 'N/A',
            str(order.product_id),
            float(order.total_amount),
            order.status,
            order.payment_method,
            order.delivery_type,
            order.delivery_address or 'N/A',
            order.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            order.updated_at.strftime('%Y-%m-%d %H:%M:%S')
        ])

    # Return CSV file
    csv_content = output.getvalue()
    output.close()

    filename = f"orders_{period}_{datetime.now().strftime('%Y%m%d')}.csv"

    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename={filename}"
        }
    )


@router.get("/products/csv")
async def export_products_csv(
    status_filter: Optional[str] = Query(None, description="Filter by status"),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Export seller products to CSV

    Returns CSV file with product data
    """
    await verify_seller_access(current_user)

    # Build query
    query = select(Product).where(Product.seller_id == current_user.id)

    if status_filter:
        query = query.where(Product.status == status_filter)

    query = query.order_by(desc(Product.created_at))

    result = await db.execute(query)
    products = result.scalars().all()

    # Create CSV
    output = StringIO()
    writer = csv.writer(output)

    # Write header
    writer.writerow([
        'Product ID',
        'Title',
        'Price (KGS)',
        'Discount Price (KGS)',
        'Discount %',
        'Category ID',
        'Status',
        'Views Count',
        'Is Promoted',
        'Created At'
    ])

    # Write data
    for product in products:
        writer.writerow([
            str(product.id),
            product.title,
            float(product.price),
            float(product.discount_price) if product.discount_price else '',
            product.discount_percent or '',
            product.category_id or '',
            product.status,
            product.views_count,
            'Yes' if product.is_promoted else 'No',
            product.created_at.strftime('%Y-%m-%d %H:%M:%S')
        ])

    # Return CSV file
    csv_content = output.getvalue()
    output.close()

    filename = f"products_{datetime.now().strftime('%Y%m%d')}.csv"

    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename={filename}"
        }
    )


@router.get("/analytics/json")
async def export_analytics_json(
    period: str = Query("month", description="Period: week, month, quarter, year"),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Export seller analytics in JSON format

    Returns comprehensive analytics data
    """
    await verify_seller_access(current_user)

    # Calculate date range
    now = datetime.utcnow()
    if period == "week":
        start_date = now - timedelta(weeks=1)
    elif period == "month":
        start_date = now - timedelta(days=30)
    elif period == "quarter":
        start_date = now - timedelta(days=90)
    else:  # year
        start_date = now - timedelta(days=365)

    from sqlalchemy import func

    # Get orders stats
    orders_result = await db.execute(
        select(
            func.count(Order.id),
            func.sum(Order.total_amount)
        ).where(
            and_(
                Order.seller_id == current_user.id,
                Order.created_at >= start_date
            )
        )
    )
    orders_count, total_revenue = orders_result.one()

    # Get products stats
    products_result = await db.execute(
        select(
            func.count(Product.id),
            func.sum(Product.views_count)
        ).where(Product.seller_id == current_user.id)
    )
    products_count, total_views = products_result.one()

    # Get top products
    top_products_result = await db.execute(
        select(Product)
        .where(Product.seller_id == current_user.id)
        .order_by(desc(Product.views_count))
        .limit(10)
    )
    top_products = top_products_result.scalars().all()

    # Get reviews stats
    from app.models.review import Review
    reviews_result = await db.execute(
        select(
            func.count(Review.id),
            func.avg(Review.rating)
        ).where(Review.seller_id == current_user.id)
    )
    reviews_count, avg_rating = reviews_result.one()

    return {
        "period": period,
        "start_date": start_date.isoformat(),
        "end_date": now.isoformat(),
        "summary": {
            "total_orders": orders_count or 0,
            "total_revenue": float(total_revenue) if total_revenue else 0.0,
            "total_products": products_count or 0,
            "total_views": int(total_views) if total_views else 0,
            "total_reviews": reviews_count or 0,
            "average_rating": float(avg_rating) if avg_rating else 0.0
        },
        "top_products": [
            {
                "id": str(p.id),
                "title": p.title,
                "views_count": p.views_count,
                "price": float(p.price)
            }
            for p in top_products
        ],
        "export_date": now.isoformat()
    }


@router.get("/report/comprehensive")
async def export_comprehensive_report(
    format: str = Query("json", description="Format: json or csv"),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Generate comprehensive seller report

    Includes orders, products, analytics in one export
    """
    await verify_seller_access(current_user)

    if format not in ["json", "csv"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid format. Use 'json' or 'csv'"
        )

    # Get all data
    from sqlalchemy import func
    from app.models.review import Review

    # Orders
    orders_result = await db.execute(
        select(Order).where(Order.seller_id == current_user.id).order_by(desc(Order.created_at))
    )
    orders = orders_result.scalars().all()

    # Products
    products_result = await db.execute(
        select(Product).where(Product.seller_id == current_user.id).order_by(desc(Product.created_at))
    )
    products = products_result.scalars().all()

    # Reviews
    reviews_result = await db.execute(
        select(Review).where(Review.seller_id == current_user.id).order_by(desc(Review.created_at))
    )
    reviews = reviews_result.scalars().all()

    if format == "json":
        return {
            "seller_id": str(current_user.id),
            "seller_name": current_user.full_name,
            "export_date": datetime.utcnow().isoformat(),
            "statistics": {
                "total_orders": len(orders),
                "total_products": len(products),
                "total_reviews": len(reviews),
                "total_revenue": sum(float(o.total_amount) for o in orders)
            },
            "orders": [
                {
                    "order_number": o.order_number,
                    "total_amount": float(o.total_amount),
                    "status": o.status,
                    "created_at": o.created_at.isoformat()
                }
                for o in orders
            ],
            "products": [
                {
                    "title": p.title,
                    "price": float(p.price),
                    "status": p.status,
                    "views_count": p.views_count
                }
                for p in products
            ],
            "reviews": [
                {
                    "rating": r.rating,
                    "comment": r.comment,
                    "created_at": r.created_at.isoformat()
                }
                for r in reviews
            ]
        }
    else:  # CSV format
        # For CSV, create a summary report
        output = StringIO()
        writer = csv.writer(output)

        writer.writerow(['Comprehensive Seller Report'])
        writer.writerow(['Generated:', datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')])
        writer.writerow([])

        writer.writerow(['Statistics'])
        writer.writerow(['Total Orders:', len(orders)])
        writer.writerow(['Total Products:', len(products)])
        writer.writerow(['Total Reviews:', len(reviews)])
        writer.writerow(['Total Revenue (KGS):', sum(float(o.total_amount) for o in orders)])
        writer.writerow([])

        writer.writerow(['Recent Orders'])
        writer.writerow(['Order Number', 'Amount (KGS)', 'Status', 'Date'])
        for o in orders[:20]:  # Top 20 recent orders
            writer.writerow([
                o.order_number,
                float(o.total_amount),
                o.status,
                o.created_at.strftime('%Y-%m-%d')
            ])

        csv_content = output.getvalue()
        output.close()

        filename = f"report_comprehensive_{datetime.now().strftime('%Y%m%d')}.csv"

        return Response(
            content=csv_content,
            media_type="text/csv",
            headers={
                "Content-Disposition": f"attachment; filename={filename}"
            }
        )
