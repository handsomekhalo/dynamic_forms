



from system_management.models import Profile
from system_management.general_func_classes import BaseFormSerializer

from rest_framework import serializers
from django.contrib.auth import get_user_model
from system_management.models import UserType
from django.contrib.auth.password_validation import validate_password


User = get_user_model()

class RegisterSerializer(serializers.Serializer):
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    confirm_password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    # user_type = serializers.ChoiceField(choices=[(ut.name, ut.name) for ut in UserType.objects.all()], required=True)

    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError("Passwords do not match.")
        return attrs

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        # user_type_name = validated_data.pop('user_type')

        # Fetch the user type object
        
        # Create the user
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
        )
        return user



class SendEmailSerializer(BaseFormSerializer):
    """Serializer for sending email"""
    context_data = serializers.DictField(
        allow_empty=True,
        required=False,
        read_only=False,
        write_only=False,
        error_messages={
            'required': 'The context data field is required.'
        }
    )
    html_tpl_path = serializers.CharField(
        max_length=100,
        required=True,
        read_only=False,
        write_only=False,
        error_messages={
            'required': 'The html_tpl_path field is required.',
            'max_length': 'The html_tpl_path field must be less than 100 characters.'
        }
    )
    subject = serializers.CharField(
        max_length=100,
        required=True,
        read_only=False,
        write_only=False,
        error_messages={
            'required': 'The subject field is required.',
            'max_length': 'The subject field must be less than 100 characters.'
        }
    )


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = [
            'id_number',
            'passport_number',
            'phone_number',
            'street_address',
            'suburb',
            'city',
            'province',
            'postal_code',
        ]

    def update(self, instance, validated_data):
        # You can add any logic here before saving
        return super().update(instance, validated_data)

    def create(self, validated_data):
        # Normally this will only be used if you're manually creating a Profile
        return Profile.objects.create(**validated_data)



class ProfileModelSerializer(serializers.ModelSerializer):
    # lockout_start_time = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S")
    class Meta:
        """Metaclass for profile model serializer."""
        model = Profile
        fields = (
            'phone_number',
            'city',
            'suburb',
            'province',
            # 'first_login',
            # 'lockout_start_time',
            # 'remaining_attempts'
        )

class UserModelSerializer(serializers.ModelSerializer):
    """User model serializer for cleaning user values"""
    user_type__name = serializers.SerializerMethodField()
    last_login = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S")
    date_joined = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S")
    profile = serializers.SerializerMethodField()

    @staticmethod
    def get_user_type__name(obj):
        """
        Get user type name
        
        :param obj:
            object type instance
        :return:
            user type name
        """
        return obj.user_type.name

    @staticmethod
    def get_profile(obj):
        """
        Get user profile
        
        :param obj:
            object type instance
        :return:
            user profile
        """
        try:
            profile = Profile.objects.get(user_id=obj.id)
            profile = ProfileModelSerializer(profile).data
        except Profile.DoesNotExist:
            profile = ''
        return profile

    class Meta:
        """Metaclass for user model serializer."""
        model = User
        fields = (
            'id',
            'first_name',
            'last_name',
            'email',
            'is_active',
            'last_login',
            'date_joined',
            'user_type_id',
            'user_type__name',
            'profile'
        )


class UserTypeModelSerializer(serializers.ModelSerializer):
    """User type model serializer for cleaning user type values"""

    class Meta:
        """Metaclass for user type model serializer."""
        model = UserType
        fields = (
            'id',
            'name'
        )



class GetAlltUserModelSerializer(serializers.ModelSerializer):
    """User model serializer for cleaning user values"""
    user_type__name = serializers.SerializerMethodField()
    last_login = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S")
    date_joined = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S")
    profile = serializers.SerializerMethodField()

    @staticmethod
    def get_user_type__name(obj):
        """
        Get user type name
        
        :param obj:
            object type instance
        :return:
            user type name
        """
        return obj.user_type.name

    @staticmethod
    def get_profile(obj):
        """
        Get user profile
        
        :param obj:
            object type instance
        :return:
            user profile
        """
        try:
            profile = Profile.objects.get(user_id=obj.id)
            profile = ProfileModelSerializer(profile).data
        except Profile.DoesNotExist:
            profile = ''
        return profile

    class Meta:
        """Metaclass for user model serializer."""
        model = User
        fields = (
            'id',
            'first_name',
            'last_name',
            'email',
            'is_active',
            'last_login',
            'date_joined',
            'user_type_id',
            'user_type__name',
            'profile'
        )



class UserUpdateSerializer(BaseFormSerializer):
    """User update serializer for cleaning user values"""

    first_name = serializers.CharField(
        max_length=250,
        required=True,
        read_only=False,
        write_only=False,
        error_messages={
            'required': 'The first name field is required.',
            'max_length': 'The first name field must be less than 250 characters.'
        }
    )
    last_name = serializers.CharField(
        max_length=250,
        required=True,
        read_only=False,
        write_only=False,
        error_messages={
            'required': 'The last name field is required.',
            'max_length': 'The last name field must be less than 250 characters.'
        }
    )
    email = serializers.EmailField(
        max_length=250,
        required=True,
        read_only=False,
        write_only=False,
        error_messages={
            'required': 'The email field is required.',
            'max_length': 'The email field must be less than 250 characters.'
        }
    )
    user_id = serializers.IntegerField(
        required=True,
        read_only=False,
        write_only=False,
        error_messages={
            'required': 'The user id field is required.',
        }
    )
    # phone_number = serializers.CharField(
    #     max_length=10,
    #     required=True,
    #     read_only=False,
    #     write_only=False,
    #     error_messages={
    #         'required': 'The phone number field is required.',
    #         'max_length': 'The phone number field must be less than 250 characters.'
    #     }
    # )

    user_type_id = serializers.IntegerField(
        required=False,
        allow_null=True,  # Allow null to be passed if not included

        read_only=False,
        write_only=False,
        error_messages={
            'required': 'The user type id field is required.',
        }
    )



class CreateUserSerializer(serializers.ModelSerializer):
    """
    Serializer for creating new users with profile information
    """
    password = serializers.CharField(write_only=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True)
    user_type_id = serializers.IntegerField()
    
    # Profile fields
    id_number = serializers.CharField(max_length=13, required=False, allow_blank=True)
    passport_number = serializers.CharField(max_length=255, required=False, allow_blank=True)
    phone_number = serializers.CharField(max_length=10, required=True)
    street_address = serializers.CharField(max_length=255, required=True)
    suburb = serializers.CharField(max_length=255, required=True)
    city = serializers.CharField(max_length=255, required=True)
    province = serializers.CharField(max_length=255, required=True)
    postal_code = serializers.CharField(max_length=5, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = [
            'email', 'first_name', 'last_name', 'password', 'confirm_password',
            'user_type_id', 'id_number', 'passport_number', 'phone_number',
            'street_address', 'suburb', 'city', 'province', 'postal_code'
        ]

    def validate(self, attrs):
        """
        Validate password confirmation and user type
        """
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError("Password and confirm password do not match.")
        
        # Validate user type exists
        try:
            UserType.objects.get(id=attrs['user_type_id'])
        except UserType.DoesNotExist:
            raise serializers.ValidationError("Invalid user type.")
        
        # Validate that either id_number or passport_number is provided
        if not attrs.get('id_number') and not attrs.get('passport_number'):
            raise serializers.ValidationError("Either ID number or passport number must be provided.")
        
        return attrs

    def validate_email(self, value):
        """
        Validate email uniqueness
        """
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate_phone_number(self, value):
        """
        Validate phone number format (assuming South African format)
        """
        if not value.isdigit() or len(value) != 10:
            raise serializers.ValidationError("Phone number must be 10 digits.")
        return value

    def validate_id_number(self, value):
        """
        Validate South African ID number format (13 digits)
        """
        if value and (not value.isdigit() or len(value) != 13):
            raise serializers.ValidationError("ID number must be 13 digits.")
        return value

    def create(self, validated_data):
        """
        Create user and associated profile
        """
        # Extract profile data
        profile_data = {
            'id_number': validated_data.pop('id_number', ''),
            'passport_number': validated_data.pop('passport_number', ''),
            'phone_number': validated_data.pop('phone_number'),
            'street_address': validated_data.pop('street_address'),
            'suburb': validated_data.pop('suburb'),
            'city': validated_data.pop('city'),
            'province': validated_data.pop('province'),
            'postal_code': validated_data.pop('postal_code', ''),
            'first_login': True
        }
        
        # Remove confirm_password as it's not needed for user creation
        validated_data.pop('confirm_password')
        
        # Get user type
        user_type = UserType.objects.get(id=validated_data.pop('user_type_id'))
        
        # Create user
        user = User.objects.create_user(
            **validated_data,
            user_type=user_type
        )
        
        # Create profile
        Profile.objects.create(user=user, **profile_data)
        
        return user