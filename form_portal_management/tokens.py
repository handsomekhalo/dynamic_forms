from django.core import signing

SALT = 'form-magic-link'
EXPIRY = 60 * 60 * 72  # 72 hours

def generate_form_token(user_id, form_id):
    return signing.dumps(
        {'user_id': user_id, 'form_id': form_id},
        salt=SALT
    )

def validate_form_token(token):
    try:
        return signing.loads(token, salt=SALT, max_age=EXPIRY)
    except signing.SignatureExpired:
        return {'error': 'expired'}
    except signing.BadSignature:
        return {'error': 'invalid'}