using UnityEngine;

public class BuildingCamera : MonoBehaviour
{
    [SerializeField] private float smoothTime = 0.3f;
    [SerializeField] private float rotationSpeed = 0.5f;

    [SerializeField] private float offsetForwardDistance = 3.5f;
    [SerializeField] private float offsetHeight = 2f;

    public Transform target;

    private readonly int rotationDirectionLimit = 60;

    private Vector3 velocity = Vector3.zero;
    private Vector3 offset;
    private int rotationCount;

    private void OnEnable()
    {
        if (target)
        {
            rotationCount = 0;
            CalculateOffset();
            transform.position = target.position + offset;
        }
    }

    private void LateUpdate()
    {
        RotateAroundTarget();

        Vector3 futurePoition = target.position + offset;
        transform.position = Vector3.SmoothDamp(transform.position, futurePoition, ref velocity, smoothTime);
        transform.LookAt(target);
    }

    private void RotateAroundTarget()
    {
        CheckRotationDirection();       

        Quaternion horizontalRotation = Quaternion.AngleAxis(rotationSpeed, target.up);
        offset = horizontalRotation * offset;

        rotationCount++;
    }

    /// <summary>
    /// Checks for need of rotation direction change
    /// </summary>
    private void CheckRotationDirection()
    {
        //TODO: check angle of rotation and not count

        if (rotationCount >= rotationDirectionLimit)
        {
            rotationCount = -rotationDirectionLimit;
            rotationSpeed = -rotationSpeed;
        }
    }

    /// <summary>
    /// Calculates camera offset from current target
    /// </summary>
    private void CalculateOffset()
    {
        offset = target.forward * offsetForwardDistance;
        offset.y += offsetHeight;
    }
}
