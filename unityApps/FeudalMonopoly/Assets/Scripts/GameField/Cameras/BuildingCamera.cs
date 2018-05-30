using UnityEngine;

public class BuildingCamera : MonoBehaviour
{
    [SerializeField] private float smoothTime = 0.3f;
    [SerializeField] private float rotationSpeed = 0.5f;

    [SerializeField] private float offsetForwardDistance = 3.5f;
    [SerializeField] private float offsetHeight = 2f;

    public Transform Target { get; set; }

    private readonly int rotationDirectionLimit = 60;

    private Vector3 targetPosition;
    private Vector3 velocity = Vector3.zero;
    private Vector3 offset;
    private int rotationCount;

    public void OnBuildingCaptured()
    {
        if (Target)
        {
            targetPosition = Target.position;
            rotationCount = 0;
            CalculateOffset();
            transform.position = Target.position + offset;
        }
    }

    private void LateUpdate()
    {
        if (Target)
        {
            RotateAroundTarget();

            Vector3 futurePoition = Target.position + offset;
            transform.position = Vector3.SmoothDamp(transform.position, futurePoition, ref velocity, smoothTime);

            Vector3 lookAtPosition = new Vector3(targetPosition.x, targetPosition.y + offsetHeight / 1.75f, targetPosition.z);
            transform.LookAt(lookAtPosition);
        }
    }

    /// <summary>
    /// Rotates building camera around current Target
    /// </summary>
    private void RotateAroundTarget()
    {
        CheckRotationDirection();       

        Quaternion horizontalRotation = Quaternion.AngleAxis(rotationSpeed, Target.up);
        offset = horizontalRotation * offset;

        rotationCount++;
    }

    /// <summary>
    /// Checks for need of rotation direction change
    /// </summary>
    private void CheckRotationDirection()
    {
        //TODO: check angle of rotation and donnot use count
        if (rotationCount >= rotationDirectionLimit)
        {
            rotationCount = -rotationDirectionLimit;
            rotationSpeed = -rotationSpeed;
        }
    }

    /// <summary>
    /// Calculates camera offset from current Target
    /// </summary>
    private void CalculateOffset()
    {
        offset = Target.forward * offsetForwardDistance;
        offset.y += offsetHeight;
    }
}
