from django.core.management.base import BaseCommand
from application_management.models import FormResponse
from form_portal_management.models import Document

class Command(BaseCommand):
    help = "Patches existing Document records by adding missing question and main_category from related FormResponse."

    def handle(self, *args, **options):
        docs_to_patch = Document.objects.filter(question__isnull=True, main_category__isnull=True)

        if not docs_to_patch.exists():
            self.stdout.write(self.style.SUCCESS("✅ No documents need patching."))
            return

        updated_count = 0
        skipped_count = 0

        for doc in docs_to_patch:
            try:
                matching_response = FormResponse.objects.filter(file_upload=doc.file).first()
                if matching_response:
                    doc.question = matching_response.question
                    doc.main_category = matching_response.category
                    doc.save()
                    updated_count += 1
                    self.stdout.write(self.style.SUCCESS(
                        f"✅ Updated doc {doc.id} with question {doc.question.id}, category {doc.main_category.id}"
                    ))
                else:
                    skipped_count += 1
                    self.stdout.write(self.style.WARNING(
                        f"⚠️ No matching FormResponse for doc {doc.id} (file: {doc.file})"
                    ))
            except Exception as e:
                self.stdout.write(self.style.ERROR(
                    f"❌ Error processing doc {doc.id}: {e}"
                ))

        self.stdout.write(self.style.SUCCESS(f"\n✅ Completed. {updated_count} updated, {skipped_count} skipped."))
