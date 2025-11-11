"""
Location Models (City, Market)
"""
from sqlalchemy import Column, String, Integer, ForeignKey, Text, Numeric
from sqlalchemy.orm import relationship

from app.database.base import Base


class City(Base):
    """City model"""
    __tablename__ = "cities"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    slug = Column(String(100), unique=True, nullable=False)
    region = Column(String(100), nullable=True)
    sort_order = Column(Integer, default=0)

    # Relationships
    markets = relationship("Market", back_populates="city")
    seller_profiles = relationship("SellerProfile", back_populates="city")

    def __repr__(self):
        return f"<City {self.name}>"


class Market(Base):
    """Market model"""
    __tablename__ = "markets"

    id = Column(Integer, primary_key=True, autoincrement=True)
    city_id = Column(Integer, ForeignKey("cities.id"), nullable=False)
    name = Column(String(100), nullable=False)
    address = Column(Text, nullable=True)
    latitude = Column(Numeric(10, 8), nullable=True)
    longitude = Column(Numeric(11, 8), nullable=True)

    # Relationships
    city = relationship("City", back_populates="markets")
    seller_profiles = relationship("SellerProfile", back_populates="market")

    def __repr__(self):
        return f"<Market {self.name}>"
