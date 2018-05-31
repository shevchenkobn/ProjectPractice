using UnityEngine;

public class InputManager : MonoBehaviour
{
    public static event System.Action MouseButtonDown = delegate { };

    public static InputManager Instance { get; private set; }

    [SerializeField] private float zoomSpeed = 2f;
    [SerializeField] private float horizontalRotationSpeed = 2f;
    [SerializeField] private float verticalRotationSpeed = 3f;

    private Camera freeCamera;
    private FreeCamera freeCameraComponent;

    private bool isSwiping = false;
    private Vector2 lastTouchPosition;

    /// <summary>
    /// Makes sure that Instance references only to one object in the scene
    /// </summary>
    private void Awake()
    {
        if (!Instance)
        {
            Instance = this;
        }
        else
        {
            Destroy(gameObject);
        }
    }

    private void Update()
    {
        if (IsAbleToHandleInput())
        {
#if UNITY_STANDALONE || UNITY_EDITOR

            PerformPcInput();
#else
            PerformMobileInput(); 
#endif            
        }
    }

    private void OnEnable()
    {
        CameraManager.CameraManagerLoaded += OnCameraManageLoaded;
    }

    private void OnDisable()
    {
        CameraManager.CameraManagerLoaded -= OnCameraManageLoaded;
    }

    public Ray GetInputRay()
    {
        return SupervisorManager.Instance.CameraManager.ActiveCamera.ScreenPointToRay(Input.mousePosition);
    }

    private void OnCameraManageLoaded()
    {
        freeCamera = SupervisorManager.Instance.CameraManager.freeCamera;
        freeCameraComponent = freeCamera.GetComponent<FreeCamera>();
    }   

    /// <summary>
    /// Checks whether input can be applied
    /// </summary>
    /// <returns></returns>
    private bool IsAbleToHandleInput()
    {
        Camera activeCamera = SupervisorManager.Instance.CameraManager.ActiveCamera;        
        return activeCamera.Equals(freeCamera);
    }

    /// <summary>
    /// Handles input for pc
    /// </summary>
    private void PerformPcInput()
    {
        if (Input.GetMouseButtonDown(0))
        {
            MouseButtonDown();
        }

        if (Input.GetMouseButton(1))
        {
            Cursor.lockState = CursorLockMode.Locked;
            HandlePcRotationInput();
        }
        else
        {
            Cursor.lockState = CursorLockMode.None;
        }

        HandlePcZoom();
    }

    /// <summary>
    /// Handles rotation input for pc
    /// </summary>
    private void HandlePcRotationInput()
    {
        HandlePcHorizontalInput();
        HandlePcVerticalInput();

        CorrectFreeCameraPosition();
    }

    /// <summary>
    /// Moves camera back or foth to anchor
    /// </summary>
    private void CorrectFreeCameraPosition()
    {
        freeCameraComponent.CalculateNewPosition();
        freeCameraComponent.CorrectDistanceToAnchor();
    }

    /// <summary>
    /// Handles zoom for pc
    /// </summary>
    private void HandlePcZoom()
    {
        if (Input.GetAxis("Mouse ScrollWheel") != 0)
        {
            HandleZoom(Input.GetAxis("Mouse ScrollWheel"));
        }
    }

    /// <summary>
    /// Applies vertical rotation for pc
    /// </summary>
    private void HandlePcVerticalInput()
    {
        if (Input.GetAxis("Mouse Y") != 0)
        {
            HandleVerticalInput(Input.GetAxis("Mouse Y"));
        }
    }

    /// <summary>
    /// Applies horizontal rotation for pc
    /// </summary>
    private void HandlePcHorizontalInput()
    {
        if (Input.GetAxis("Mouse X") != 0)
        {
            HandleHorizontalInput(Input.GetAxis("Mouse X"));
        }
    }

    /// <summary>
    /// Zooms camera
    /// </summary>
    /// <param name="input">Value of zoom input</param>
    private void HandleZoom(float input)
    {
        freeCameraComponent.ZoomCamera(input);        
    }

    /// <summary>
    /// Rotates camera vertically
    /// </summary>
    /// <param name="input">Value of input</param>
    private void HandleVerticalInput(float input)
    {
        freeCameraComponent.HandleVerticalInput(input);        
    }

    /// <summary>
    /// Rotates camera horizontally
    /// </summary>
    /// <param name="input">Value of input</param>
    private void HandleHorizontalInput(float input)
    {
        freeCameraComponent.HandleHorizontalInput(input);        
    }

    /// <summary>
    /// Handles mobile input
    /// </summary>
    private void PerformMobileInput()
    {
        if (Input.touchCount > 0)
        {
            if (HandleMobileZoom()) return;

            if (Input.touchCount == 1 && Input.GetTouch(0).phase == TouchPhase.Began)
            {
                MouseButtonDown();
                return;
            }

            Cursor.lockState = CursorLockMode.Locked;
            HandleMobileRotationInput();
        }
        else
        {
            Cursor.lockState = CursorLockMode.None;
        }        
    }

    /// <summary>
    /// Handles mobile rotation input
    /// </summary>
    private void HandleMobileRotationInput()
    {
        if (Input.GetTouch(0).deltaPosition.sqrMagnitude != 0)
        {
            if (isSwiping == false)
            {
                isSwiping = true;
                lastTouchPosition = Input.GetTouch(0).position;
            }
            else
            {
                Vector2 direction = Input.GetTouch(0).position - lastTouchPosition;

                if (Mathf.Abs(direction.x) > Mathf.Abs(direction.y))
                {
                    HandleMobileHorizontalInput(direction);
                }
                else
                {
                    HandleMobileVerticalInput(direction);
                }

                CorrectFreeCameraPosition();
            }
        }
        else
        {
            isSwiping = false;
        }
    }

    /// <summary>
    /// Applies vertical rotation for mobile
    /// </summary>
    /// <param name="direction">Direction of swipe</param>
    private void HandleMobileVerticalInput(Vector2 direction)
    {
        float input = Mathf.Sign(direction.y) * verticalRotationSpeed;
        HandleVerticalInput(input);
    }

    /// <summary>
    /// Applies horizontal rotation for mobile
    /// </summary>
    /// <param name="direction">Direction of swipe</param>
    private void HandleMobileHorizontalInput(Vector2 direction)
    {
        float input = Mathf.Sign(direction.x) * horizontalRotationSpeed;
        HandleHorizontalInput(input);
    }

    /// <summary>
    /// Tries to detect input for zoom and zooms free camera
    /// </summary>
    /// <returns>True if can zoom and false - otherwise</returns>
    private bool HandleMobileZoom()
    {
        if (Input.touchCount == 2)
        {
            Touch touchZero = Input.GetTouch(0);
            Touch touchOne = Input.GetTouch(1);
            
            Vector2 touchZeroPreviousPos = touchZero.position - touchZero.deltaPosition;
            Vector2 touchOnePreviousPos = touchOne.position - touchOne.deltaPosition;

            float previousTouchDelta = (touchZeroPreviousPos - touchOnePreviousPos).magnitude;
            float currenttouchDelta = (touchZero.position - touchOne.position).magnitude;

            float deltaMagnitude = currenttouchDelta - previousTouchDelta;

            HandleZoom(Mathf.Sign(deltaMagnitude) * zoomSpeed);
            return true;
        }

        return false;
    }
}
