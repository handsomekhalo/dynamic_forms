from django.core.management import BaseCommand
from question_management.models import QuestionType

class Command(BaseCommand):
    help = 'Adding question types'
    
    def handle(self, *args, **options):
        question_types_to_create = ['Text', 'Selection', 'Checkbox', 'Date', 'File', 'Number']
        
        for question_type in question_types_to_create:
            # Filter by the 'name' field instead of 'question_type'
            question_type_exists = QuestionType.objects.filter(name=question_type).exists()  
            if not question_type_exists:
                QuestionType.objects.create(name=question_type)  # Create using 'name' field
                self.stdout.write(self.style.SUCCESS(f"Question Type '{question_type}' has been successfully created."))
            else:
                self.stdout.write(self.style.WARNING(f"Question Type '{question_type}' already exists. Skipping creation."))
