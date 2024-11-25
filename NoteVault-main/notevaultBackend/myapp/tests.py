from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.contrib.auth.models import User
from myapp.models import Category, Note

class NoteAppTests(APITestCase):
    def setUp(self):
        """
        Set up the test environment:
        - Create a test user.
        - Authenticate the client with the test user.
        - Create a default test category associated with the user.
        """
        self.user = User.objects.create_user(username="testuser", email="test@example.com", password="password123")
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)  # Authenticate the client
        self.category = Category.objects.create(title="Test Category", user=self.user)

    def test_register_user(self):
        """
        Test user registration:
        - Send a POST request with user details.
        - Verify the response includes tokens and has a status code of 201.
        """
        data = {"username": "newuser", "email": "newuser@example.com", "password": "newpassword"}
        response = self.client.post('/register/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_login_user(self):
        """
        Test user login:
        - Send a POST request with correct credentials.
        - Verify the response includes tokens and has a status code of 200.
        """
        response = self.client.post('/login/', {"username": "testuser", "password": "password123"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)

    def test_reset_password(self):
        """
        Test password reset:
        - Send a POST request with current and new password.
        - Verify the password is updated and response status is 200.
        """
        data = {"current_password": "password123", "new_password": "newpassword123"}
        response = self.client.post('/reset-password/', data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("newpassword123"))

    def test_view_profile(self):
        """
        Test profile retrieval:
        - Send a GET request to fetch the user's profile.
        - Verify the username matches and status code is 200.
        """
        response = self.client.get('/profile/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["username"], "testuser")

    def test_update_profile(self):
        """
        Test profile update:
        - Send a PUT request to update user details.
        - Verify the changes persist and response status is 200.
        """
        data = {"email": "updated@example.com"}
        response = self.client.put('/profile/', data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.email, "updated@example.com")

    def test_create_category(self):
        """
        Test category creation:
        - Send a POST request to create a new category.
        - Verify the response contains the correct title and status code is 201.
        """
        data = {"title": "New Category"}
        response = self.client.post('/categories/create/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["title"], "New Category")

        # Validate user association
        category = Category.objects.get(title="New Category")
        self.assertEqual(category.user, self.user)

    def test_get_categories(self):
        """
        Test fetching categories:
        - Send a GET request to retrieve categories.
        - Verify the correct number of categories and status code is 200.
        """
        response = self.client.get('/categories/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_create_note_with_category(self):
        """
        Test note creation with an existing category:
        - Send a POST request with note details and a valid category ID.
        - Verify the note is created successfully with a status code of 201.
        """
        data = {"title": "Test Note", "content": "This is a test note.", "category": self.category.id}
        response = self.client.post('/notes/create/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["title"], "Test Note")
        self.assertEqual(response.data["category"], self.category.id)

    def test_create_note_without_category(self):
        """
        Test note creation without specifying a category:
        - Send a POST request with note details but no category ID.
        - Verify a 400 error is returned with a category-related error message.
        """
        data = {"title": "Test Note", "content": "This is a test note."}
        response = self.client.post('/notes/create/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)  # Expecting 400 error
        self.assertIn("error", response.data)  # Check if category error is returned

    def test_get_notes(self):
        """
        Test fetching all notes:
        - Create a sample note.
        - Send a GET request to retrieve all notes.
        - Verify the correct number of notes and status code is 200.
        """
        Note.objects.create(title="Note 1", content="Content 1", category=self.category, user=self.user)
        response = self.client.get('/notes/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_get_notes_by_category(self):
        """
        Test fetching notes by category:
        - Create a sample note under a specific category.
        - Send a GET request with the category ID.
        - Verify the correct notes are returned and status code is 200.
        """
        Note.objects.create(title="Note 1", content="Content 1", category=self.category, user=self.user)
        response = self.client.get(f'/notes/category/{self.category.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_get_note_by_id(self):
        """
        Test fetching a specific note by ID:
        - Create a sample note.
        - Send a GET request with the note ID.
        - Verify the correct note is returned and status code is 200.
        """
        note = Note.objects.create(title="Note 1", content="Content 1", category=self.category, user=self.user)
        response = self.client.get(f'/notes/{note.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["title"], "Note 1")

    def test_update_note(self):
        """
        Test updating a note:
        - Create a sample note.
        - Send a PUT request with updated note details.
        - Verify the note is updated successfully and status code is 200.
        """
        note = Note.objects.create(title="Old Title", content="Old Content", category=self.category, user=self.user)
        data = {"title": "Updated Title"}
        response = self.client.put(f'/notes/update/{note.id}/', data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        note.refresh_from_db()
        self.assertEqual(note.title, "Updated Title")

    def test_delete_note(self):
        """
        Test deleting a note:
        - Create a sample note.
        - Send a DELETE request with the note ID.
        - Verify the note is deleted and status code is 200.
        """
        note = Note.objects.create(title="To Delete", content="Content", category=self.category, user=self.user)
        response = self.client.delete(f'/notes/delete/{note.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(Note.objects.filter(id=note.id).exists())

    def test_unsuccessful_login_invalid_credentials(self):
        """
        Test login with invalid credentials:
        - Send a POST request with incorrect username and password.
        - Verify the response contains an error message and status code is 401.
        """
        response = self.client.post('/login/', {"username": "wronguser", "password": "wrongpassword"})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn("detail", response.data)

    def test_unsuccessful_login_missing_fields(self):
        """
        Test login with missing fields:
        - Send a POST request without the required password field.
        - Verify the response contains an error message and status code is 400.
        """
        response = self.client.post('/login/', {"username": "testuser"})  # Missing password
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("password", response.data)

    def test_unsuccessful_registration_missing_fields(self):
        """
        Test user registration with missing fields:
        - Send a POST request without all required fields (email and password).
        - Verify the response contains an error message and status code is 400.
        """
        data = {"username": "newuser"}  # Missing email and password
        response = self.client.post('/register/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", response.data)

    def test_unsuccessful_registration_duplicate_username(self):
        """
        Test user registration with a duplicate username:
        - Send a POST request with a username that already exists.
        - Verify the response contains an error message and status code is 400.
        """
        data = {"username": "testuser", "email": "newemail@example.com", "password": "password123"}
        response = self.client.post('/register/', data)  # Duplicate username
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", response.data)

    def test_unsuccessful_reset_password_invalid_current_password(self):
        """
        Test password reset with an incorrect current password:
        - Send a POST request with an invalid current password.
        - Verify the response contains an error message and status code is 400.
        """
        data = {"current_password": "wrongpassword", "new_password": "newpassword123"}
        response = self.client.post('/reset-password/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", response.data)

    def test_unsuccessful_reset_password_missing_fields(self):
        """
        Test password reset with missing fields:
        - Send a POST request without the required new password field.
        - Verify the response contains an error message and status code is 400.
        """
        data = {"current_password": "password123"}  # Missing new password
        response = self.client.post('/reset-password/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", response.data)

    def test_unsuccessful_create_category_missing_title(self):
        """
        Test category creation without a title:
        - Send a POST request without the required title field.
        - Verify the response contains an error message and status code is 400.
        """
        data = {}  # Missing title
        response = self.client.post('/categories/create/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("title", response.data)

    def test_unsuccessful_get_notes_by_invalid_category(self):
        """
        Test fetching notes by a non-existent category:
        - Send a GET request with an invalid category ID.
        - Verify the response contains an error message and status code is 404.
        """
        response = self.client.get('/notes/category/9999/')  # Non-existent category ID
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn("error", response.data)

    def test_unsuccessful_get_note_invalid_id(self):
        """
        Test fetching a note by a non-existent ID:
        - Send a GET request with an invalid note ID.
        - Verify the response contains an error message and status code is 404.
        """
        response = self.client.get('/notes/9999/')  # Non-existent note ID
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn("message", response.data)

    def test_unsuccessful_update_note_invalid_id(self):
        """
        Test updating a note with a non-existent ID:
        - Send a PUT request with an invalid note ID.
        - Verify the response contains an error message and status code is 404.
        """
        data = {"title": "Updated Title"}
        response = self.client.put('/notes/update/9999/', data)  # Non-existent note ID
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn("message", response.data)

    def test_unsuccessful_delete_note_invalid_id(self):
        """
        Test deleting a note with a non-existent ID:
        - Send a DELETE request with an invalid note ID.
        - Verify the response contains an error message and status code is 404.
        """
        response = self.client.delete('/notes/delete/9999/')  # Non-existent note ID
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn("message", response.data)

    def test_unsuccessful_create_note_invalid_category(self):
        """
        Test creating a note with an invalid category:
        - Send a POST request with a non-existent category ID.
        - Verify the response contains an error message and status code is 400.
        """
        data = {"title": "Test Note", "content": "This is a test note.", "category": 9999}  # Non-existent category
        response = self.client.post('/notes/create/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", response.data)
