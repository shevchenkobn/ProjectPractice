using UnityEngine;

public class FreeCamera : MonoBehaviour
{
    public Transform anchor;

    [SerializeField] private float horizontalRotationSpeed = 5f;
    [SerializeField] private float verticalRotationSpeed = 2.5f;

    [SerializeField] private float zoomSpeed = 30f;
    [SerializeField] private float zoomOut = 80f;
    [SerializeField] private float zoomIn = 20f;

    [SerializeField] private float maxHeight = 20f;
    [SerializeField] private float minHeight = 10f;

    private Vector3 offset;
    private Vector3 newPosition;
    private Camera cameraComponent;

    private Quaternion horizontalRotation;    

    private float verticalRotation;
    private float distance;
    private float zoom;

    private void Start()
    {
        newPosition = transform.position;
        cameraComponent = GetComponent<Camera>();
        zoom = cameraComponent.fieldOfView;
        offset = transform.position - anchor.position;
        distance = offset.magnitude;
    }

    private void Update()
    {
        if (Input.GetMouseButton(1))
        {
            Cursor.lockState = CursorLockMode.Locked;

            if (Input.GetAxis("Mouse X") != 0)
            {
                HandleHorizontalInput();
            }

            if (Input.GetAxis("Mouse Y") != 0)
            {
                HandleVerticalInput();
            }

            CalculateNewPosition();
            CorrectDistanceToAnchor();
        }
        else
        {
            Cursor.lockState = CursorLockMode.None;
        }

        if (Input.GetAxis("Mouse ScrollWheel") != 0)
        {
            ZoomCamera();
        }
    }

    private void LateUpdate()
    {
        if (transform.position != newPosition)
        {
            transform.position = Vector3.Slerp(transform.position, newPosition, 0.2f);
        }

        transform.LookAt(anchor);
        cameraComponent.fieldOfView = zoom;
    }
    
    /// <summary>
    /// Changes the scope of camera
    /// </summary>
    private void ZoomCamera()
    {
        zoom -= Input.GetAxis("Mouse ScrollWheel") * zoomSpeed;
        zoom = Mathf.Clamp(zoom, zoomIn, zoomOut);
    }

    /// <summary>
    /// Takes vertical input that is vertical rotation around the anchor
    /// </summary>
    private void HandleVerticalInput()
    {
        verticalRotation = -Input.GetAxis("Mouse Y") * verticalRotationSpeed;
        offset += transform.up * verticalRotation;
    }

    /// <summary>
    /// Takes horizontal input that is horizontal rotation around the anchor
    /// </summary>
    private void HandleHorizontalInput()
    {
        horizontalRotation = Quaternion.AngleAxis(Input.GetAxis("Mouse X") * horizontalRotationSpeed, anchor.up);
        offset = horizontalRotation * offset;
    }

    /// <summary>
    /// Calculates newPosition for camera
    /// </summary>
    private void CalculateNewPosition()
    {
        newPosition = anchor.position + offset;
        float clampedY = Mathf.Clamp(offset.y, minHeight, maxHeight);
        newPosition = new Vector3(newPosition.x, clampedY, newPosition.z);
    }

    /// <summary>
    /// Moves newPosition back or forth if needed
    /// </summary>
    private void CorrectDistanceToAnchor()
    {
        PullForward();
        PullBackward();
    }

    /// <summary>
    /// Changes newPosition with bringing it forward to keep distance between camera and the anchor the same
    /// </summary>
    private void PullForward()
    {
        while ((newPosition - anchor.position).magnitude > distance)
        {
            newPosition += transform.forward;
        }
    }

    /// <summary>
    /// Changes newPosition with bringing it backward to keep distance between camera and the anchor the same
    /// </summary>
    private void PullBackward()
    {
        while ((newPosition - anchor.position).magnitude < distance)
        {
            newPosition -= transform.forward;
        }
    }
}