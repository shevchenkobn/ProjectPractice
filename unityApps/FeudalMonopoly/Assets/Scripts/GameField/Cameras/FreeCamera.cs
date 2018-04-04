using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class FreeCamera : MonoBehaviour
{
    public Transform anchor;

    [SerializeField] private float rotationSpeed = 5f;
    [SerializeField] private float movementSpeed = 5f;

    [SerializeField] private float zoomSpeed = 30f;
    [SerializeField] private float zoomOut = 80f;
    [SerializeField] private float zoomIn = 20f;

    [SerializeField] private float maxHeight = 40f;
    [SerializeField] private float minHeight = 4f;

    [SerializeField] private float minAnchorDistance = 25f;
    [SerializeField] private float maxAnchorDistance = 65f;

    private Vector3 offset;
    private Camera cameraComponent;

    private float anchorGravity;
    private float zoom;

    private void Start()
    {
        cameraComponent = GetComponent<Camera>();
        offset = transform.position - anchor.position;
        zoom = cameraComponent.fieldOfView;
    }

    private void Update()
    {
        offset = transform.position - anchor.position;

        if (Input.GetMouseButton(1))
        {
            Cursor.lockState = CursorLockMode.Locked;

            Quaternion rotation = Quaternion.AngleAxis(Input.GetAxis("Mouse X") * rotationSpeed, Vector3.up);

            if (Input.GetAxis("Mouse Y") != 0)
            {
                anchorGravity = Vector3.up.y * Input.GetAxis("Mouse Y") * movementSpeed;
            }
            else
            {
                anchorGravity = 0f;
            }

            offset = rotation * offset;
        }
        else
        {
            Cursor.lockState = CursorLockMode.None;
        }

        if (Input.GetAxis("Mouse ScrollWheel") != 0)
        {
            zoom -= Input.GetAxis("Mouse ScrollWheel") * zoomSpeed;
            zoom = Mathf.Clamp(zoom, zoomIn, zoomOut);
        }
    }

    private void LateUpdate()
    {
        Vector3 newPosition = anchor.position + offset;
        newPosition.y = Mathf.Clamp(newPosition.y, minHeight, maxHeight);      

        transform.position = Vector3.Slerp(transform.position, newPosition, 0.5f);        
        transform.LookAt(anchor);

        Vector3 modefiedPosition = transform.position + transform.forward * anchorGravity;
        float newPositionToAnchorDistance = (anchor.position - modefiedPosition).magnitude;

        if (newPositionToAnchorDistance >= minAnchorDistance 
            && newPositionToAnchorDistance <= maxAnchorDistance)
        {
            transform.position = modefiedPosition;
        }       

        cameraComponent.fieldOfView = zoom;
    }
}
