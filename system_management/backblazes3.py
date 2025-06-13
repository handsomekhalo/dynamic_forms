import boto3
import pathlib
from django.conf import settings
from botocore.exceptions import ClientError


def get_backblaze_client():
    return boto3.client(
        's3',
        # endpoint_url='https://s3.us-west-004.backblazeb2.com',  # Your Backblaze S3 endpoint
        endpoint_url='https://s3.us-east-005.backblazeb2.com',  # Your Backblaze S3 endpoint

        aws_access_key_id=settings.BACK_BLAZE_KEY_ID,
        aws_secret_access_key=settings.BACK_BLAZE_APLLICATION_KEY
    )


# def upload_to_backblaze_s3(file, file_name):
#     """
#     Upload file to Backblaze B2 bucket.
#     """
#     path = settings.COMPANY_PATH  # Optional subfolder logic
#     s3_file_name = f"{path}/{file_name}"
#     bucket_name = settings.BACK_BLAZE_BUCKET_NAME

#     s3 = get_backblaze_client()

#     try:
#         s3.upload_fileobj(file, bucket_name, s3_file_name)

#         # Construct the B2 public URL
#         s3_url = f"https://s3.us-west-004.backblazeb2.com/{bucket_name}/{s3_file_name}"
#         return s3_url

#     except ClientError as e:
#         print(f"Upload error: {e}")
#         return None
def upload_to_backblaze_s3(file, file_name, company_name=None):
    path = company_name or "default"

    print('path',path)
    s3_file_name = f"{path}/{file_name}"

    s3 = get_backblaze_client()
    print('s3',s3)

    bucket_name = settings.BACK_BLAZE_BUCKET_NAME

    s3.upload_fileobj(file, bucket_name, s3_file_name)

    s3_url = f"https://s3.us-east-005.backblazeb2.com/{bucket_name}/{s3_file_name}"
    return s3_url


def open_s3_file(filepath):
    """
    Generate a presigned URL for viewing a file from Backblaze B2.
    """
    bucket = settings.BACK_BLAZE_BUCKET_NAME
    if bucket not in str(filepath):
        return filepath

    s3 = get_backblaze_client()
    file_path = str(filepath).split(f"{bucket}/")[-1]

    content_type = "application/octet-stream"
    suffix = pathlib.Path(file_path).suffix.lower()

    if suffix == ".pdf":
        content_type = "application/pdf"
    elif suffix == ".mp4":
        content_type = "video/mp4"

    try:
        url = s3.generate_presigned_url(
            ClientMethod='get_object',
            Params={
                'Bucket': bucket,
                'Key': file_path,
                "ResponseContentDisposition": "inline",
                "ResponseContentType": content_type
            },
            ExpiresIn=3600
        )
        return url
    except ClientError as e:
        print(f"Presign error: {e}")
        return filepath


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
