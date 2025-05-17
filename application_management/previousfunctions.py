


# @csrf_exempt
# def assign_category_to_form(request):
#     print('executing')

#     if request.method != 'POST':
#         return JsonResponse({
#             "status": "error",
#             "message": "Method not allowed"
#         }, status=405)

#     try:
#         # Step 1: Extract Token from Headers
#         auth_header = request.headers.get("Authorization", "")
#         print('auth_header', auth_header)
#         token = None
        
#         # Check for token in headers with different formats
#         if auth_header.startswith("Token "):
#             token = auth_header[6:]
#         elif auth_header.startswith("Bearer "):
#             token = auth_header[7:]
#         else:
#             # If no prefix, assume the whole string is the token
#             token = auth_header
            
#         print('auth token used:', token)

#         if not token:
#             # Try to get token from session if not in headers
#             token = request.session.get("token")
#             print('token from session:', token)
#             if not token:
#                 print('No token found in headers or session')
#                 return JsonResponse({
#                     "status": "error",
#                     "message": "Authorization token is required."
#                 }, status=401)

#         # Save token in session
#         request.session["token"] = token
#         request.session.modified = True

#         # Step 2: Parse JSON Payload
#         try:
#             data = json.loads(request.body)
#             print('data', data)
#         except json.JSONDecodeError:
#             return JsonResponse({'status': 'error', 'message': 'Invalid JSON data'}, status=400)

#         # Step 3: Validate Form Type and Main Category
#         form_type_id = data.get('formId')
#         main_category_id = data.get('categoryId')
#         action = data.get('action', 'add')  # Default to 'add' if not specified

#         if not form_type_id or not main_category_id:
#             return JsonResponse({
#                 "status": "error",
#                 "message": "Form type and main category are required."
#             }, status=400)

#         # Step 4: Send Data to the Internal API to Assign Category to Form
#         api_url = f"{host_url(request)}{reverse_lazy('assign_category_to_form_api')}"
#         payload = {
#             "form_type_id": form_type_id,
#             "main_category_id": main_category_id,
#             "action": action  # Pass the action to the API
#         }
#         print('payload', payload)
        
#         # Set headers for internal API request - Try various auth header formats
#         # Sometimes internal APIs require different auth formats
#         auth_headers = [
#             {
#                 "Content-Type": "application/json",
#                 "Authorization": f"Bearer {token}",
#             },
#             {
#                 "Content-Type": "application/json",
#                 "Authorization": f"Token {token}",
#             },
#             {
#                 "Content-Type": "application/json",
#                 "Authorization": token,
#             },
#             {
#                 "Content-Type": "application/json",
#                 "Token": token,
#             }
#         ]
        
#         response = None
#         for headers in auth_headers:
#             try:
#                 print("Trying with headers:", headers)
#                 response = requests.post(
#                     api_url, 
#                     headers=headers, 
#                     json=payload,  # Use json parameter instead of manually dumping
#                     timeout=10
#                 )
#                 print('response status:', response.status_code)
                
#                 if response.status_code != 401:  # If not unauthorized, break the loop
#                     break
                    
#             except Exception as e:
#                 print(f"Error with headers {headers}: {str(e)}")
#                 continue
                
#         if not response or response.status_code == 401:
#             print("All auth header attempts failed")
#             return JsonResponse({
#                 "status": "error",
#                 "message": "Failed to authenticate with the internal API."
#             }, status=401)
            
#         print('response is ***********', response)
        
#         try:
#             response.raise_for_status()
#         except requests.RequestException as e:
#             return JsonResponse({'status': 'error', 'message': f'Error while assigning category to form: {str(e)}'}, status=500)

#         # Step 5: Handle API Response
#         try:
#             response_data = response.json()
#         except ValueError:
#             print("Invalid JSON response:", response.content)
#             return JsonResponse({'status': 'error', 'message': 'Invalid response from assign_category_to_form_api'}, status=500)

#         if response.status_code in [200, 201] and response_data.get('status') == 'success':
#             return JsonResponse({
#                 "status": "success",
#                 "message": "Category assigned to form successfully.",
#                 "assignment": response_data.get('assignment')
#             }, status=201)
#         else:
#             return JsonResponse({
#                 "status": "error",
#                 "message": response_data.get('error', 'Failed to assign category to form.')
#             }, status=400)

#     except Exception as e:
#         import traceback
#         traceback.print_exc()
#         return JsonResponse({
#             "status": "error",
#             "message": f"Server error occurred: {str(e)}"
#         }, status=500)



from django.http import JsonResponse


@csrf_exempt
def assign_category_to_form(request):
    print('executing assign_category_to_form view')

    if request.method != 'POST':
        return JsonResponse({
            "status": "error",
            "message": "Method not allowed"
        }, status=405)

    try:
        # Step 1: Extract Token from Headers
        auth_header = request.headers.get("Authorization", "")
        print('auth_header received:', auth_header)
        
        token = None
        if auth_header.startswith("Token "):
            token = auth_header[6:]
        elif auth_header.startswith("Bearer "):
            token = auth_header[7:]
        else:
            token = auth_header
            
        print('token extracted:', token)

        if not token:
            print('No token in headers')
            return JsonResponse({
                "status": "error",
                "message": "Authorization token is required."
            }, status=401)

        # Step 2: Parse JSON Payload
        try:
            data = json.loads(request.body)
            print('received data:', data)
        except json.JSONDecodeError:
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON data'}, status=400)

        # Step 3: Validate Form Type and Main Category
        form_type_id = data.get('formId')
        main_category_id = data.get('categoryId')
        action = data.get('action', 'add')

        if not form_type_id or not main_category_id:
            return JsonResponse({
                "status": "error",
                "message": "Form type and main category are required."
            }, status=400)

        # Step 4: Send Data to the Internal API to Assign Category to Form
        api_url = f"{host_url(request)}{reverse_lazy('assign_category_to_form_api')}"
        print('Calling internal API at:', api_url)
        
        payload = {
            "form_type_id": form_type_id,
            "main_category_id": main_category_id,
            "action": action
        }
        print('with payload:', payload)
        
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {token}"
        }
        print('with headers:', headers)
        
        try:
            response = requests.post(
                api_url, 
                headers=headers, 
                json=payload,  # Using json parameter to handle serialization
                timeout=10
            )
            print('Response status code:', response.status_code)
            print('Response content:', response.content)
            
            # If we get a 401, try different auth header formats
            if response.status_code == 401:
                print("First attempt failed with 401, trying different auth formats")
                
                auth_formats = [
                    {"Authorization": f"Token {token}"},
                    {"Authorization": token},
                    {"Token": token}
                ]
                
                for auth_format in auth_formats:
                    test_headers = {"Content-Type": "application/json", **auth_format}
                    print("Trying with headers:", test_headers)
                    
                    test_response = requests.post(
                        api_url,
                        headers=test_headers,
                        json=payload,
                        timeout=10
                    )
                    
                    print(f"test Response with {auth_format}: {test_response.status_code}")
                    
                    if test_response.status_code != 401:
                        response = test_response
                        break
            
            response.raise_for_status()
        except requests.RequestException as e:
            print(f"Request exception: {str(e)}")
            return JsonResponse({'status': 'error', 'message': f'Error while assigning category to form: {str(e)}'}, status=500)

        # Step 5: Handle API Response
        try:
            response_data = response.json()
            print('Parsed response data:', response_data)
        except ValueError:
            print("Could not parse response as JSON:", response.content)
            return JsonResponse({'status': 'error', 'message': 'Invalid response from API'}, status=500)

        # Return the API response to the frontend
        return JsonResponse(response_data, status=response.status_code)

    except Exception as e:
        import traceback
        print("Exception occurred:")
        traceback.print_exc()
        return JsonResponse({
            "status": "error",
            "message": f"Server error occurred: {str(e)}"
        }, status=500)



@csrf_exempt
def assign_or_update_category(request):
    print('executing assign_category_to_form view')

    if request.method != 'POST':
        return JsonResponse({
            "status": "error",
            "message": "Method not allowed"
        }, status=405)

    try:
        # Step 1: Extract Token from Headers
        auth_header = request.headers.get("Authorization", "")
        print('auth_header received:', auth_header)
        
        token = None
        if auth_header.startswith("Token "):
            token = auth_header[6:]
        elif auth_header.startswith("Bearer "):
            token = auth_header[7:]
        else:
            token = auth_header
            
        print('token extracted:', token)

        if not token:
            print('No token in headers')
            return JsonResponse({
                "status": "error",
                "message": "Authorization token is required."
            }, status=401)

        # Step 2: Parse JSON Payload
        try:
            data = json.loads(request.body)
            print('received data:', data)
        except json.JSONDecodeError:
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON data'}, status=400)

        # Step 3: Validate Form Type and Main Category
        form_type_id = data.get('formId')
        main_category_id = data.get('categoryId')
        action = data.get('action', 'add')

        if not form_type_id or not main_category_id:
            return JsonResponse({
                "status": "error",
                "message": "Form type and main category are required."
            }, status=400)

        # Step 4: Send Data to the Internal API to Assign Category to Form
        api_url = f"{host_url(request)}{reverse_lazy('assign_or_update_category_api')}"
        print('Calling internal API at:', api_url)
        
        payload = {
            "form_type_id": form_type_id,
            "main_category_id": main_category_id,
            "action": action
        }
        print('with payload:', payload)
        
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {token}"
        }
        print('with headers:', headers)
        
        try:
            response = requests.post(
                api_url, 
                headers=headers, 
                json=payload,  # Using json parameter to handle serialization
                timeout=10
            )
            print('Response status code:', response.status_code)
            print('Response content:', response.content)
            
            # If we get a 401, try different auth header formats
            if response.status_code == 401:
                print("First attempt failed with 401, trying different auth formats")
                
                auth_formats = [
                    {"Authorization": f"Token {token}"},
                    {"Authorization": token},
                    {"Token": token}
                ]
                
                for auth_format in auth_formats:
                    test_headers = {"Content-Type": "application/json", **auth_format}
                    print("Trying with headers:", test_headers)
                    
                    test_response = requests.post(
                        api_url,
                        headers=test_headers,
                        json=payload,
                        timeout=10
                    )
                    
                    print(f"Response with {auth_format}: {test_response.status_code}")
                    
                    if test_response.status_code != 401:
                        response = test_response
                        break
            
            response.raise_for_status()
        except requests.RequestException as e:
            print(f"Request exception: {str(e)}")
            return JsonResponse({'status': 'error', 'message': f'Error while assigning category to form: {str(e)}'}, status=500)

        # Step 5: Handle API Response
        try:
            response_data = response.json()
            print('Parsed response data:', response_data)
        except ValueError:
            print("Could not parse response as JSON:", response.content)
            return JsonResponse({'status': 'error', 'message': 'Invalid response from API'}, status=500)

        # Return the API response to the frontend
        return JsonResponse(response_data, status=response.status_code)

    except Exception as e:
        import traceback
        print("Exception occurred:")
        traceback.print_exc()
        return JsonResponse({
            "status": "error",
            "message": f"Server error occurred: {str(e)}"
        }, status=500)
    
# @csrf_exempt
# def assign_category_to_form(request):
#     print('executing')

#     if request.method != 'POST':
#         return JsonResponse({
#             "status": "error",
#             "message": "Method not allowed"
#         }, status=405)

#     try:
#         # Step 1: Extract Token from Headers
#         auth_header = request.headers.get("Authorization", "")
#         print('auth_header', auth_header)
#         token = None
#         if auth_header.startswith("Token "):
#             token = auth_header[6:]
#             print('auth header', token)
#         elif auth_header.startswith("Bearer "):
#             token = auth_header[7:]
#             print('auth header', token)

#         if not token:
#             print('we here no tokern executed')
#             return JsonResponse({
#                 "status": "error",
#                 "message": "Authorization token is required."
#             }, status=401)
        

#         # Save token in session
#         request.session["token"] = token
#         request.session.modified = True

#         headers = {
#             "Content-Type": "application/json",
#             "Authorization": f"Bearer {token}",
#         }

#         # Step 2: Parse JSON Payload
#         try:
#             data = json.loads(request.body)
#             print('data', data)
#         except json.JSONDecodeError:
#             return JsonResponse({'status': 'error', 'message': 'Invalid JSON data'}, status=400)

#         # Step 3: Validate Form Type and Main Category
#         form_type_id = data.get('formId')
#         main_category_id = data.get('categoryId')

#         if not form_type_id or not main_category_id:
#             return JsonResponse({
#                 "status": "error",
#                 "message": "Form type and main category are required."
#             }, status=400)

#         # Step 4: Send Data to the Internal API to Assign Category to Form
#         api_url = f"{host_url(request)}{reverse_lazy('assign_category_to_form_api')}"
#         payload = {
#             "form_type_id": form_type_id,
#             "main_category_id": main_category_id
#         }
#         print('payload', payload)
        
#         try:
#             response = requests.post(api_url, headers=headers, data=json.dumps(payload), timeout=10)
#             print('response is ***********', response)
#             response.raise_for_status()
#         except requests.RequestException as e:
#             return JsonResponse({'status': 'error', 'message': f'Error while assigning category to form: {str(e)}'}, status=500)

#         # Step 5: Handle API Response
#         try:
#             response_data = response.json()
#         except ValueError:
#             return JsonResponse({'status': 'error', 'message': 'Invalid response from assign_category_to_form_api'}, status=500)

#         if response.status_code == 201 and response_data.get('status') == 'success':
#             return JsonResponse({
#                 "status": "success",
#                 "message": "Category assigned to form successfully.",
#                 "assignment": response_data.get('assignment')
#             }, status=201)
#         else:
#             return JsonResponse({
#                 "status": "error",
#                 "message": response_data.get('error', 'Failed to assign category to form.')
#             }, status=400)

#     except Exception as e:
#         import traceback
#         traceback.print_exc()
#         return JsonResponse({
#             "status": "error",
#             "message": f"Server error occurred: {str(e)}"
#         }, status=500)
