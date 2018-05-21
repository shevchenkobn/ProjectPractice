using UnityEngine;

public class Anchor : MonoBehaviour
{
    private Transform transformComponent;

	void Start ()
    {
        transformComponent = GetComponent<Transform>();
    }

    private void OnDrawGizmos()
    {         
        //TODO: keep free camera on the same distance from anchor but move only on the surface of sphere
        if (transformComponent)
        {
            float distance = Vector3.Distance(CameraManager.Instance.ActiveCamera.transform.position, transformComponent.position);
            Gizmos.DrawWireSphere(transformComponent.position, distance);
        }
    }
}
