"""
Warehouse Statistics Schemas
"""
from pydantic import BaseModel
from decimal import Decimal


class WarehouseStatistics(BaseModel):
    """Warehouse statistics for Business tariff sellers"""
    # Складская статистика
    total_products_count: int  # Количество позиций товаров
    total_stock_quantity: int  # Общее количество единиц на складе
    total_purchase_cost: Decimal  # Общая сумма закупа

    # Финансовая статистика
    total_revenue: Decimal  # Общая выручка от продаж
    projected_revenue: Decimal  # Предварительная выручка (stock * sale_price)
    total_items_sold: int  # Количество проданных товаров

    # Партнерская программа
    total_partner_commission: Decimal  # Общая комиссия партнеров (потенциальная)
    paid_partner_commission: Decimal  # Выплаченная комиссия партнеров (от реальных продаж)

    # Прибыль
    profit: Decimal  # Прибыль = выручка - закуп - выплаченная комиссия
    projected_profit: Decimal  # Проектируемая прибыль

    class Config:
        from_attributes = True
