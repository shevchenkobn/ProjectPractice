using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class DiceSide : MonoBehaviour
{
    public bool IsOnGround { get; private set; }    
    public int SideValue { get { return value; } }

    [SerializeField] private int value;

    private void OnTriggerStay(Collider other)
    {
        if (other.CompareTag("Floor"))
        {
            IsOnGround = true;
        }
    }

    private void OnTriggerExit(Collider other)
    {
        if (other.CompareTag("Floor"))
        {
            IsOnGround = false;
        }
    }
}
