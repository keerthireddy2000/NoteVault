from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Category, Note
from .serializers import CategorySerializer, NoteSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.contrib.auth.hashers import check_password
import google.generativeai as genai
import os



@api_view(['POST'])
def register(request):
    data = request.data
    try:
        user = User.objects.create_user(username=data['username'], email=data['email'], password=data['password'],first_name=data['first_name'],  # Add first name
            last_name=data['last_name'])
        user.save()
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)
        return Response({
            'message': 'User created successfully',
            'access': access_token,
            'refresh': refresh_token
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def login(request):
    from rest_framework_simplejwt.views import TokenObtainPairView
    return TokenObtainPairView.as_view()(request._request)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reset_password(request):
    user = request.user
    data = request.data
    current_password = data.get('current_password')
    new_password = data.get('new_password')
    if not current_password or not new_password:
        return Response({'error': 'Both current and new passwords are required'}, status=status.HTTP_400_BAD_REQUEST)
    if not check_password(current_password, user.password):
        return Response({'error': 'Current password is incorrect'}, status=status.HTTP_400_BAD_REQUEST)
    if current_password == new_password:
        return Response({'error': 'New password cannot be the same as the current password'}, status=status.HTTP_400_BAD_REQUEST)
    user.set_password(new_password)
    user.save()

    return Response({'message': 'Password reset successfully'}, status=status.HTTP_200_OK)

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def profile(request):
    if request.method == 'GET':
        user = request.user
        return Response({
            'username': user.username,
            'email': user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
        })

    elif request.method == 'PUT':
        data = request.data
        user = request.user
        email = data.get('email')
        first_name = data.get('first_name')
        last_name = data.get('last_name')
        if email:
            user.email = email
        if first_name:
            user.first_name = first_name
        if last_name:
            user.last_name = last_name

        user.save()
        return Response({'message': 'Email updated successfully'}, status=status.HTTP_200_OK)
    return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)   


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_category(request):
    serializer = CategorySerializer(data=request.data)

    if serializer.is_valid():
        serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def edit_category(request, category_id):
    try:
        print("cat", category_id)
        category = Category.objects.get(id=category_id)
        print("cat", category)
    except Category.DoesNotExist:
        return Response({"detail": "Category not found."}, status=status.HTTP_404_NOT_FOUND)
    if category.user != request.user:
        return Response({"detail": "You are not authorized to edit this category."}, status=status.HTTP_403_FORBIDDEN)
    serializer = CategorySerializer(category, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_categories(request):
    categories = Category.objects.filter(user=request.user)
    serializer = CategorySerializer(categories, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_note(request):
    title = request.data.get('title')
    content = request.data.get('content')
    category_id = request.data.get('category')
    pinned = request.data.get('pinned', False)

    if not title or not content or not category_id:
        return Response({'error': 'All fields are required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        category = Category.objects.get(id=category_id, user=request.user)
    except Category.DoesNotExist:
        return Response({'error': 'Invalid category'}, status=status.HTTP_400_BAD_REQUEST)

    note = Note.objects.create(
        title=title,
        content=content,
        category=category,
        user=request.user,
        pinned=bool(pinned)
    )
    serializer = NoteSerializer(note)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_pin(request, note_id):
    try:
        note = Note.objects.get(id=note_id, user=request.user)
    except Note.DoesNotExist:
        return Response({'error': 'Note not found'}, status=status.HTTP_404_NOT_FOUND)
    note.pinned = not note.pinned
    note.save()

    return Response({'message': 'Pin status updated', 'pinned': note.pinned}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_notes(request):
    notes = Note.objects.filter(user=request.user).order_by('-pinned')
    serializer = NoteSerializer(notes, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_notes_by_category(request, category_id):
    try:
        category = Category.objects.get(id=category_id, user=request.user)
        notes = Note.objects.filter(category=category, user=request.user).order_by('-pinned')
        serializer = NoteSerializer(notes, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Category.DoesNotExist:
        return Response({'error': 'Category not found'}, status=status.HTTP_404_NOT_FOUND)
    

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_note(request, note_id):
    try:
        note = Note.objects.get(id=note_id, user=request.user)
    except Note.DoesNotExist:
        return Response({'message': 'Note not found'}, status=status.HTTP_404_NOT_FOUND)
    
    serializer = NoteSerializer(note)
    return Response(serializer.data)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_note(request, note_id):
    try:
        note = Note.objects.get(id=note_id, user=request.user)
    except Note.DoesNotExist:
        return Response({'message': 'Note not found'}, status=status.HTTP_404_NOT_FOUND)
    serializer = NoteSerializer(note, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_note(request, note_id):
    try:
        note = Note.objects.get(id=note_id, user=request.user)
    except Note.DoesNotExist:
        return Response({'message': 'Note not found'}, status=status.HTTP_404_NOT_FOUND)

    note.delete()
    return Response({'message': 'Note deleted successfully'}, status=status.HTTP_200_OK)

@api_view(['DELETE'])

@permission_classes([IsAuthenticated])
def delete_category(request, category_id):

    try:
        category = Category.objects.get(id=category_id, user=request.user)

    except Category.DoesNotExist:
        return Response({'message': 'Category not found'}, status=status.HTTP_404_NOT_FOUND)
    notes = Note.objects.filter(category=category) 

    notes.delete()
    category.delete()
    return Response({'message': 'Category and associated notes deleted successfully'}, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def search_notes(request):
    """
    Search notes by title or category.
    Query parameters:
    - `q`: Search query (matches title or category name).
    """
    query = request.query_params.get('q', None)
    if not query:
        return Response({'error': 'Search query parameter `q` is required'}, status=status.HTTP_400_BAD_REQUEST)
    notes = Note.objects.filter(user=request.user)
    filtered_notes = notes.filter(
        title__icontains=query
    ) | notes.filter(
        category__title__icontains=query
    )
    serializer = NoteSerializer(filtered_notes, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
def reset_new_password(request):
    print("data", request.data)
    data = request.data
    username = data.get('username')
    email = data.get('email')
    if not username:
        return Response({'error': 'Username is required'}, status=status.HTTP_400_BAD_REQUEST)
    if not email:
        return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return Response({'error': 'User with this username does not exist'}, status=status.HTTP_404_NOT_FOUND)
    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({'error': 'User with this email does not exist'}, status=status.HTTP_404_NOT_FOUND)
    try:
        user = User.objects.get(username=username, email=email)
    except User.DoesNotExist:
        return Response({'error': 'Username and email do not match'}, status=status.HTTP_404_NOT_FOUND)
    new_password = data.get('new_password')
    re_type_password = data.get('re_type_password')
    if not new_password or not re_type_password:
        return Response({'error': 'Both new and re-type passwords are required fields'}, 
                         status=status.HTTP_400_BAD_REQUEST)
    if new_password != re_type_password:
        return Response({'error': 'Passwords do not match'}, status=status.HTTP_400_BAD_REQUEST)
    user.set_password(new_password)
    user.save()
    return Response({'message': 'Password reset successfully'}, status=status.HTTP_200_OK)

@api_view(['POST'])
def summarize_text(request):
    KEY = os.getenv('API_KEY')
    original_text = request.data.get('text')
    genai.configure(api_key=KEY)
    model = genai.GenerativeModel("gemini-1.5-flash")
    response = model.generate_content(f"Act as a professional summarizer. Your task is to condense the following text while retaining key information and personal essence: {original_text}")
    print(response.text)
    return Response({'summary': response.text}, status=status.HTTP_200_OK)

@api_view(['POST'])
def check_text(request):
    KEY = os.getenv('API_KEY')
    original_text = request.data.get('text')
    genai.configure(api_key=KEY)
    model = genai.GenerativeModel("gemini-1.5-flash")
    response = model.generate_content(f"Correct grammar and spelling: {original_text}")
    print(response.text)
    return Response({'correctedText': response.text}, status=status.HTTP_200_OK)  