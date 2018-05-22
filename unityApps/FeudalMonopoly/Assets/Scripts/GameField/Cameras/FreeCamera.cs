using System.Collections;
using System.Collections.Generic;
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
        Debug.Log("Dist " + distance);
        if (Input.GetMouseButton(1))
        {
            Cursor.lockState = CursorLockMode.Locked;

            if (Input.GetAxis("Mouse X") != 0)
            {
                horizontalRotation = Quaternion.AngleAxis(Input.GetAxis("Mouse X") * horizontalRotationSpeed, anchor.up);
                offset = horizontalRotation * offset;
            }

            if (Input.GetAxis("Mouse Y") != 0)
            {
                verticalRotation = -Input.GetAxis("Mouse Y") * verticalRotationSpeed;                
                offset += transform.up * verticalRotation;                  
            }            
            
            newPosition = anchor.position + offset;
            float clampedY = Mathf.Clamp(offset.y, minHeight, maxHeight);
            newPosition = new Vector3(newPosition.x, clampedY, newPosition.z);

            Debug.Log("Dist " + distance);
            Debug.Log("New dist " + (newPosition - anchor.position).magnitude);

            while ((newPosition - anchor.position).magnitude > distance)
            {
                newPosition += transform.forward;
            }

            while ((newPosition - anchor.position).magnitude < distance)
            {
                newPosition -= transform.forward;
            }
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
        if (transform.position != newPosition)
        {
            transform.position = Vector3.Slerp(transform.position, newPosition, 0.2f);
        }

        transform.LookAt(anchor);
        cameraComponent.fieldOfView = zoom;
    }
}
