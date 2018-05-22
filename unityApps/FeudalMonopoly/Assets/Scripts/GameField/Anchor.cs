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
        if (transformComponent)
        {
            float distance = Vector3.Distance(CameraManager.Instance.ActiveCamera.transform.position, transformComponent.position);

            Gizmos.color = Color.black;
            Gizmos.DrawWireSphere(transformComponent.position, distance);
        }
    }
}
