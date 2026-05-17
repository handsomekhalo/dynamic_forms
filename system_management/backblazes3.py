import boto3
import pathlib
from django.conf import settings
from botocore.exceptions import ClientError
import mimetypes



def get_backblaze_client():
    return boto3.client(
        's3',
        # endpoint_url='https://s3.us-west-004.backblazeb2.com',  # Your Backblaze S3 endpoint
        endpoint_url='https://s3.us-east-005.backblazeb2.com',  # Your Backblaze S3 endpoint

        aws_access_key_id=settings.BACK_BLAZE_KEY_ID,
        aws_secret_access_key=settings.BACK_BLAZE_APLLICATION_KEY,
        region_name='us-east-005'

    )


def upload_to_backblaze_s3(file, file_name, company_name=None):
    """
    Uploads a file to Backblaze B2 bucket with the correct content type for inline viewing.
    """
    bucket = settings.BACK_BLAZE_BUCKET_NAME
    folder = company_name or "default"
    key = f"{folder}/{file_name}"

    # Guess content type
    content_type, _ = mimetypes.guess_type(file_name)
    content_type = content_type or 'application/octet-stream'

    try:
        s3 = get_backblaze_client()
        s3.upload_fileobj(
            file,
            bucket,
            key,
            ExtraArgs={'ContentType': content_type}
        )
        return f"https://s3.us-east-005.backblazeb2.com/{bucket}/{key}"
    except ClientError as e:
        print(f"[UPLOAD ERROR] {e}")
        return None
    
def open_back_blaze_s3_file(filepath):
    """
    Generates a presigned URL for a file stored on Backblaze B2 that allows inline viewing.
    """
    bucket = settings.BACK_BLAZE_BUCKET_NAME
    s3 = get_backblaze_client()

    # Convert FieldFile to string and extract key
    filepath_str = str(filepath)
    if filepath_str.startswith("http") and bucket in filepath_str:
        key = filepath_str.split(f"{bucket}/")[-1]
    elif bucket not in filepath_str:
        # Already a key (not a full URL)
        key = filepath_str
    else:
        key = filepath_str.split(f"{bucket}/")[-1]

    # Guess content type
    suffix = pathlib.Path(key).suffix.lower()
    content_type_mapping = {
        ".pdf": "application/pdf",
        ".mp4": "video/mp4",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".gif": "image/gif",
        ".txt": "text/plain",
        ".doc": "application/msword",
        ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ".xls": "application/vnd.ms-excel",
        ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    }
    content_type = content_type_mapping.get(suffix, "application/octet-stream")

    # Check if file exists before generating URL
    try:
        s3.head_object(Bucket=bucket, Key=key)
    except ClientError as e:
        print(f"[HEAD ERROR] {e}")
        return filepath_str  # Return original if file not found

    try:
        url = s3.generate_presigned_url(
            ClientMethod='get_object',
            Params={
                'Bucket': bucket,
                'Key': key,
                'ResponseContentDisposition': 'inline',
                'ResponseContentType': content_type
            },
            ExpiresIn=3600  # 1 hour
        )
        return url
    except ClientError as e:
        print(f"[PRESIGN ERROR] {e}")
        return filepath_str


def delete_s3_file(filepath):
    """
    Delete a file from Backblaze B2.
    """
    bucket = settings.BACK_BLAZE_BUCKET_NAME
    file_name = str(filepath).split(f"{bucket}/")[-1]

    s3 = get_backblaze_client()

    try:
        s3.delete_object(Bucket=bucket, Key=file_name)
        return True
    except ClientError as e:
        print(f"Delete error: {e}")
        return False
