using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class FreeCamera : MonoBehaviour
{
    public Transform anchor;

    [SerializeField] private float rotationSpeed = 5f;
    [SerializeField] private float zoomSpeed = 30;
    [SerializeField] private float maxYAngle = 85f;
    [SerializeField] private float minYAngle = 25f;
    [SerializeField] private float zoomOut = 80f;
    [SerializeField] private float zoomIn = 20f;

    private Vector3 offset;
    private Camera cameraComponent;
    private float zoom;

    private void Start()
    {
        cameraComponent = GetComponent<Camera>();
        offset = transform.position - anchor.position;
        zoom = cameraComponent.fieldOfView;
    }

    private void Update()
    {
        if (Input.GetMouseButton(1))
        {
            Cursor.lockState = CursorLockMode.Locked;
            Quaternion rotation = Quaternion.AngleAxis(Input.GetAxis("Mouse X") * rotationSpeed, Vector3.up);
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
        transform.position = Vector3.Slerp(transform.position, newPosition, 0.5f);
        transform.LookAt(anchor);

        cameraComponent.fieldOfView = zoom;
    }
}
