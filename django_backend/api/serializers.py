from rest_framework import serializers
from .models import (
    Admin, User, Destination, Hotel, HotelManager, Package, TourGuide,
    TransportProvider, TravelAgent, TripPlan, Vehicle, Coupon, Booking,
    Wishlist, ContactMessage, FAQ, Notification, Payment, Review
)

class AdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = Admin
        fields = '__all__'
        extra_kwargs = {'password': {'write_only': True}}

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['user_id', 'email', 'name', 'phone', 'avatar_url', 'role', 'is_active', 'created_at']
        extra_kwargs = {'password': {'write_only': True}}

class DestinationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Destination
        fields = '__all__'

class HotelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hotel
        fields = '__all__'

class HotelManagerSerializer(serializers.ModelSerializer):
    class Meta:
        model = HotelManager
        fields = '__all__'

class PackageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Package
        fields = '__all__'

class TourGuideSerializer(serializers.ModelSerializer):
    class Meta:
        model = TourGuide
        fields = '__all__'

class TransportProviderSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransportProvider
        fields = '__all__'

class TravelAgentSerializer(serializers.ModelSerializer):
    class Meta:
        model = TravelAgent
        fields = '__all__'

class TripPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = TripPlan
        fields = '__all__'

class VehicleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehicle
        fields = '__all__'

class CouponSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coupon
        fields = '__all__'

class BookingSerializer(serializers.ModelSerializer):
    package_title = serializers.CharField(source='package.title', read_only=True)
    hotel_name = serializers.CharField(source='hotel.name', read_only=True)
    vehicle_model = serializers.CharField(source='vehicle.model', read_only=True)
    guide_name = serializers.CharField(source='guide.name', read_only=True)

    class Meta:
        model = Booking
        fields = '__all__'

class WishlistSerializer(serializers.ModelSerializer):
    class Meta:
        model = Wishlist
        fields = '__all__'

class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = '__all__'

class FAQSerializer(serializers.ModelSerializer):
    class Meta:
        model = FAQ
        fields = '__all__'

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = '__all__'

class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.name', read_only=True)

    class Meta:
        model = Review
        fields = '__all__'
