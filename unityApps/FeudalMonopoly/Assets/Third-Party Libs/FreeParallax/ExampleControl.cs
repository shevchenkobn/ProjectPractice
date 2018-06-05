using UnityEngine;
using System.Collections;

public class ExampleControl : MonoBehaviour {

    public GameObject[] demos;

	// Use this for initialization
	void Start () {
	
	}
	
	// Update is called once per frame
	void Update () {
	
	}

    public void NextDemo()
    {
        for(int i=0;i < demos.Length; i++)
        {

            if(demos[i].activeInHierarchy)
            {
                demos[i].SetActive (false);

                if(i==demos.Length -1)
                {
                    demos[0].SetActive(true);
                }
                else
                {
                    demos[i + 1].SetActive(true);
                }
                break;
            }
        }

    }

}
