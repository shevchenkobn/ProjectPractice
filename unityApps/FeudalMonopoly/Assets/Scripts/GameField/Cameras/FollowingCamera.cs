using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class FollowingCamera : MonoBehaviour
{
    public Transform target;

    [SerializeField] private float smoothTime = 0.3f;
    [SerializeField] private Vector3 offset;

    private Vector3 velocity = Vector3.zero;
    private int cornerCount;
    private int zOffset = 20;
    private int xOffset = 20;


    private void OnEnable()
    {
        Player.Rotated += OnPlayerRotated;
    }

    private void OnDisable()
    {
        Player.Rotated -= OnPlayerRotated;
    }

    private void LateUpdate()
    {
        Vector3 futurePoition = target.position + offset;
        transform.position = Vector3.SmoothDamp(transform.position, futurePoition, ref velocity, smoothTime);

        //Vector3 rotation = transform.rotation.eulerAngles + target.rotation.eulerAngles;
        //transform.rotation = Quaternion.Euler(rotation);
        transform.LookAt(target);
    }

    private void OnPlayerRotated()
    {
        switch (cornerCount % 4)
        {
            case 0:
                {
                    offset += new Vector3(0, 0, zOffset);
                    break;
                }
            case 1:
                {
                    offset += new Vector3(-xOffset, 0, 0);
                    break;
                }
            case 2:
                {
                    offset += new Vector3(0, 0, -zOffset);
                    break;
                }
            case 3:
                {
                    offset += new Vector3(xOffset, 0, 0);
                    break;
                }
        }

        cornerCount++;
    }
}
