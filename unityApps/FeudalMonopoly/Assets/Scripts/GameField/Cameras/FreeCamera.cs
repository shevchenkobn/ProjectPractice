using UnityEngine;

public class FreeCamera : MonoBehaviour
{
    public Transform anchor;

    public Transform Transform { get; private set; }

    public float MaxHeight { get; private set; }  = 30f;
    public float MinHeight { get; private set; }  = 5f;

    [SerializeField] private float horizontalRotationSpeed = 5f;
    [SerializeField] private float verticalRotationSpeed = 2.5f;

    [SerializeField] private float zoomSpeed = 30f;
    [SerializeField] private float zoomOut = 80f;
    [SerializeField] private float zoomIn = 20f;

    private Vector3 offset;
    private Vector3 newPosition;
    private Camera cameraComponent;

    private Quaternion horizontalRotation;    

    private float verticalRotation;
    private float distance;
    private float zoom;

    private void Start()
    {
        Transform = GetComponent<Transform>();
        cameraComponent = GetComponent<Camera>();

        newPosition = Transform.position;
        zoom = cameraComponent.fieldOfView;
        offset = Transform.position - anchor.position;
        distance = offset.magnitude;
    }

    private void LateUpdate()
    {
        if (Transform.position != newPosition)
        {
            Vector3 futurePosition = Vector3.Slerp(Transform.position, newPosition, 0.2f);

            if (futurePosition.y >= MaxHeight)
            {
                futurePosition = new Vector3(futurePosition.x, MaxHeight, futurePosition.z);                
            }

            Transform.position = futurePosition;
        }

        Transform.LookAt(anchor);
        cameraComponent.fieldOfView = zoom;
    }
    
    /// <summary>
    /// Changes the scope of camera
    /// </summary>
    public void ZoomCamera(float zoomInput)
    {
        zoom -= zoomInput * zoomSpeed;
        zoom = Mathf.Clamp(zoom, zoomIn, zoomOut);
    }

    /// <summary>
    /// Takes vertical input that is vertical rotation around the anchor
    /// </summary>
    public void HandleVerticalInput(float input)
    {
        verticalRotation = -input * verticalRotationSpeed;
        offset += Transform.up * verticalRotation;
    }

    /// <summary>
    /// Takes horizontal input that is horizontal rotation around the anchor
    /// </summary>
    public void HandleHorizontalInput(float input)
    {
        horizontalRotation = Quaternion.AngleAxis(input * horizontalRotationSpeed, anchor.up);
        offset = horizontalRotation * offset;
    }

    /// <summary>
    /// Calculates newPosition for camera
    /// </summary>
    public void CalculateNewPosition()
    {
        newPosition = anchor.position + offset;
        float clampedY = Mathf.Clamp(offset.y, MinHeight, MaxHeight);
        newPosition = new Vector3(newPosition.x, clampedY, newPosition.z);

        CorrectDistanceToAnchor();
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
            newPosition += Transform.forward;
        }
    }

    /// <summary>
    /// Changes newPosition with bringing it backward to keep distance between camera and the anchor the same
    /// </summary>
    private void PullBackward()
    {
        while ((newPosition - anchor.position).magnitude < distance)
        {
            newPosition -= Transform.forward;
        }
    }
}