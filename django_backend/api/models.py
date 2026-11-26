from django.db import models

# 1. Admin (PDF Table 4, Page 21)
class Admin(models.Model):
    admin_id = models.AutoField(primary_key=True)
    email = models.CharField(max_length=150, unique=True)
    name = models.CharField(max_length=100)
    password = models.CharField(max_length=255)
    phone = models.CharField(max_length=20, null=True, blank=True)
    avatar_url = models.CharField(max_length=500, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    last_login = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'admin'

# 2. Users (PDF Table 5, Page 23)
class User(models.Model):
    user_id = models.AutoField(primary_key=True)
    email = models.CharField(max_length=150, unique=True)
    name = models.CharField(max_length=100)
    password = models.CharField(max_length=255)
    phone = models.CharField(max_length=20, null=True, blank=True)
    avatar_url = models.CharField(max_length=500, null=True, blank=True)
    role = models.CharField(max_length=50, default='CUSTOMER')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'users'

# 3. Destinations (PDF Table 7, Page 28)
class Destination(models.Model):
    destination_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=150)
    location = models.CharField(max_length=200)
    description = models.TextField(null=True, blank=True)
    image_url = models.CharField(max_length=500, null=True, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    rating = models.DecimalField(max_digits=3, decimal_places=1, default=4.8)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'destinations'

# 4. Hotels (PDF Table 8, Page 30)
class Hotel(models.Model):
    hotel_id = models.AutoField(primary_key=True)
    destination = models.ForeignKey(Destination, on_delete=models.SET_NULL, null=True, db_column='destination_id')
    name = models.CharField(max_length=200)
    description = models.TextField(null=True, blank=True)
    address = models.CharField(max_length=300, null=True, blank=True)
    image_url = models.CharField(max_length=500, null=True, blank=True)
    price_per_unit = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    rating = models.DecimalField(max_digits=3, decimal_places=1, default=4.8)
    amenities = models.JSONField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'hotels'

# 5. Hotel_managers (PDF Table 9, Page 32)
class HotelManager(models.Model):
    manager_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, db_column='user_id')
    hotel_name = models.CharField(max_length=150)
    hotel_license = models.CharField(max_length=100, null=True, blank=True)
    property_type = models.CharField(max_length=100, null=True, blank=True)
    total_rooms = models.IntegerField(default=10)
    city = models.CharField(max_length=100, null=True, blank=True)
    hotel_address = models.CharField(max_length=500, null=True, blank=True)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=4.80)
    contact_email = models.CharField(max_length=150, null=True, blank=True)
    contact_phone = models.CharField(max_length=20, null=True, blank=True)
    status = models.CharField(max_length=30, default='ACTIVE')

    class Meta:
        db_table = 'hotel_managers'

# 6. Packages (PDF Table 10, Page 34)
class Package(models.Model):
    package_id = models.AutoField(primary_key=True)
    destination = models.ForeignKey(Destination, on_delete=models.SET_NULL, null=True, db_column='destination_id')
    title = models.CharField(max_length=200)
    description = models.TextField(null=True, blank=True)
    days = models.IntegerField(default=5)
    nights = models.IntegerField(default=4)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=999.00)
    rating = models.DecimalField(max_digits=3, decimal_places=1, default=4.8)
    image_url = models.CharField(max_length=500, null=True, blank=True)
    features = models.JSONField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'packages'

# 7. Tour_guides (PDF Table 11, Page 36) - Includes user_id (Task 10)
class TourGuide(models.Model):
    guide_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, db_column='user_id')
    name = models.CharField(max_length=100)
    bio = models.TextField(null=True, blank=True)
    photo_url = models.CharField(max_length=500, null=True, blank=True)
    languages = models.JSONField(null=True, blank=True)
    rating = models.DecimalField(max_digits=3, decimal_places=1, default=4.9)
    price_per_day = models.DecimalField(max_digits=10, decimal_places=2, default=150.00)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'tour_guides'

# 8. Transport_providers (PDF Table 12, Page 38)
class TransportProvider(models.Model):
    tprovider_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, db_column='user_id')
    company_name = models.CharField(max_length=150)
    business_license = models.CharField(max_length=100, null=True, blank=True)
    fleet_size = models.IntegerField(default=5)
    vehicle_types = models.JSONField(null=True, blank=True)
    service_regions = models.JSONField(null=True, blank=True)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=4.85)
    contact_email = models.CharField(max_length=150, null=True, blank=True)
    contact_phone = models.CharField(max_length=20, null=True, blank=True)
    office_address = models.CharField(max_length=500, null=True, blank=True)
    status = models.CharField(max_length=30, default='ACTIVE')

    class Meta:
        db_table = 'transport_providers'

# 9. Travel_agents (PDF Table 13, Page 40)
class TravelAgent(models.Model):
    tagent_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, db_column='user_id')
    agency_name = models.CharField(max_length=150)
    license_number = models.CharField(max_length=100)
    commission_rate = models.DecimalField(max_digits=5, decimal_places=2, default=10.00)
    experience_years = models.IntegerField(default=5)
    destinations_covered = models.JSONField(null=True, blank=True)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=4.80)
    contact_email = models.CharField(max_length=150, null=True, blank=True)
    contact_phone = models.CharField(max_length=20, null=True, blank=True)
    office_address = models.CharField(max_length=500, null=True, blank=True)
    status = models.CharField(max_length=30, default='ACTIVE')

    class Meta:
        db_table = 'travel_agents'

# 10. Trip_plans (PDF Table 14, Page 43)
class TripPlan(models.Model):
    tplan_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, db_column='user_id')
    destination = models.ForeignKey(Destination, on_delete=models.SET_NULL, null=True, db_column='destination_id')
    title = models.CharField(max_length=200)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    budget = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    itinerary = models.JSONField(null=True, blank=True)
    status = models.CharField(max_length=20, default='planned')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'trip_plans'

# 11. Vehicles (PDF Table 15, Page 45)
class Vehicle(models.Model):
    vehicle_id = models.AutoField(primary_key=True)
    tprovider = models.ForeignKey(TransportProvider, on_delete=models.SET_NULL, null=True, db_column='tprovider_id')
    type = models.CharField(max_length=100)
    model = models.CharField(max_length=150)
    capacity = models.IntegerField(default=4)
    price_per_day = models.DecimalField(max_digits=10, decimal_places=2, default=85.00)
    image_url = models.CharField(max_length=500, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'vehicles'

# 12. Coupons (PDF Table 18, Page 50)
class Coupon(models.Model):
    coupon_id = models.AutoField(primary_key=True)
    code = models.CharField(max_length=50, unique=True)
    discount_type = models.CharField(max_length=20)  # percentage / fixed
    discount_value = models.DecimalField(max_digits=10, decimal_places=2)
    min_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    max_uses = models.IntegerField(default=100)
    used_count = models.IntegerField(default=0)
    expires_at = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'coupons'

# 13. Bookings (PDF Table 6, Page 25)
class Booking(models.Model):
    booking_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, db_column='user_id')
    package = models.ForeignKey(Package, on_delete=models.SET_NULL, null=True, db_column='package_id')
    hotel = models.ForeignKey(Hotel, on_delete=models.SET_NULL, null=True, db_column='hotel_id')
    vehicle = models.ForeignKey(Vehicle, on_delete=models.SET_NULL, null=True, db_column='vehicle_id')
    guide = models.ForeignKey(TourGuide, on_delete=models.SET_NULL, null=True, db_column='guide_id')
    coupon = models.ForeignKey(Coupon, on_delete=models.SET_NULL, null=True, db_column='coupon_id')
    start_date = models.DateField()
    end_date = models.DateField()
    guests = models.IntegerField(default=2)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=30, default='confirmed')
    notes = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'bookings'

# 14. Wishlist (PDF Table 16, Page 47)
class Wishlist(models.Model):
    wishlist_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, db_column='user_id')
    target_type = models.CharField(max_length=50, default='package')
    target_id = models.IntegerField(null=True)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'wishlist'

# 15. Contact_messages (PDF Table 17, Page 48)
class ContactMessage(models.Model):
    contact_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    email = models.CharField(max_length=150)
    subject = models.CharField(max_length=200, null=True, blank=True)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    replied_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'contact_messages'

# 16. Faqs (PDF Table 19, Page 52)
class FAQ(models.Model):
    faq_id = models.AutoField(primary_key=True)
    question = models.TextField()
    answer = models.TextField()
    category = models.CharField(max_length=100, null=True, blank=True)
    sort_order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'faqs'

# 17. Notifications (PDF Table 20, Page 53)
class Notification(models.Model):
    notification_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, db_column='user_id')
    title = models.CharField(max_length=200)
    message = models.TextField(null=True, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'notifications'

# 18. Payments (PDF Table 21, Page 54)
class Payment(models.Model):
    payment_id = models.AutoField(primary_key=True)
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, db_column='booking_id')
    user = models.ForeignKey(User, on_delete=models.CASCADE, db_column='user_id')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    method = models.CharField(max_length=30, default='card')  # card, upi, netbanking, wallet
    status = models.CharField(max_length=30, default='completed')
    transaction_ref = models.CharField(max_length=200, null=True, blank=True)
    paid_at = models.DateTimeField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'payments'

# 19. Reviews (PDF Table 22, Page 56)
class Review(models.Model):
    review_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, db_column='user_id')
    booking = models.ForeignKey(Booking, on_delete=models.SET_NULL, null=True, db_column='booking_id')
    rating = models.PositiveSmallIntegerField(default=5)
    comment = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'reviews'
