using UnityEngine;

public class DisplayPlane : MonoBehaviour
{	
	void Start ()
    {
        GetComponent<MeshRenderer>().material = CameraManager.Instance.renderTextureMaterial;
	}
}
