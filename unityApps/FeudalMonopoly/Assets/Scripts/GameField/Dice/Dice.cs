using System.Collections.Generic;
using UnityEngine;
using System.IO;

[RequireComponent(typeof(Rigidbody))]
public class Dice : MonoBehaviour
{
    public static event System.Action<int> DiceRolled = delegate { };
    public static event System.Action DiceRolling = delegate { };

    private static string path;

    private new Rigidbody rigidbody;
    private new Transform transform;

    private bool isLanded = false;
    private bool isThrown = false;

    private Vector3 initPosition;
    private Quaternion initialRotation;
    private int diceValue;

    private Dictionary<int, List<Vector3>> sideTorqueValusePair = new Dictionary<int, List<Vector3>>();
    private Vector3 torque;
    private int randomNumber;

    private DiceSide[] diceSides = new DiceSide[6];

    private void Awake()
    {
        //path = Path.Combine(Application.dataPath, "Json/Dice.json");

        rigidbody = GetComponent<Rigidbody>();
        transform = GetComponent<Transform>();
    }

    private void Start()
    {
        //JsonHelper.LoadJson(path, ref sideTorqueValusePair);

        //if (sideTorqueValusePair == null)
        //{
        //    sideTorqueValusePair = new Dictionary<int, List<Vector3>>();
        //}

        sideTorqueValusePair = new Dictionary<int, List<Vector3>>()
        {
            {
                6, new List<Vector3>()
                {
                        new Vector3(147f, 134f, 444f),
                        new Vector3(277f, 141f, 201f),
                        new Vector3(364f, 406f, 225f)
                }
            },
            {
                5, new List<Vector3>()
                {
                        new Vector3(122f, 332f, 121f),
                        new Vector3(297f, 137f, 14f),
                        new Vector3(33f, 68f, 118f)
                }
            },
            {
                4, new List<Vector3>()
                {
                        new Vector3(488f, 498f, 66f),
                        new Vector3(145f, 222f, 288f),
                        new Vector3(376f, 207f, 8f)
                }
            },
             {
                3, new List<Vector3>()
                {
                        new Vector3(194f, 383f, 129f),
                        new Vector3(337f, 94f, 141f),
                        new Vector3(194f, 409f, 196f)
                }
            },
            {
                2, new List<Vector3>()
                {
                        new Vector3(486f, 58f, 80f),
                        new Vector3(186f, 478f, 313f),
                        new Vector3(294f, 434f, 224f)
                }
            }, 
            {
                1, new List<Vector3>()
                {
                        new Vector3(200f, 117f, 211f),
                        new Vector3(388f, 403f, 387f),
                        new Vector3(326f, 65f, 39f)
                }
            }
        };

        foreach (Transform child in transform)
        {
            DiceSide side = child.GetComponent<DiceSide>();
            diceSides[side.SideValue - 1] = side;
        }

        initialRotation = transform.rotation;
        initPosition = transform.position;
        rigidbody.useGravity = false;
    }

    private void Update()
    {
        if (Input.GetKeyDown(KeyCode.Space))
        {
            RollDice();
        }

        if (rigidbody.IsSleeping() && !isLanded && isThrown)
        {
            OnLanded();
        }
        else if (rigidbody.IsSleeping() && isLanded && diceValue == 0)
        {
            Debug.Log("Error in dice rolling... Roll again!");
            RollAgain();
        }
    }

    /// <summary>
    /// Sets rigidbody properties and checks grounded side
    /// </summary>
    private void OnLanded()
    {     
        isLanded = true;

        rigidbody.useGravity = false;
        rigidbody.isKinematic = true;

        CheckSideValue();
    }

    /// <summary>
    /// Checks if dice wasn't thrown
    /// If it was, resets its position
    /// Otherwise throws the dice
    /// </summary>
    public void RollDice()
    {
        if (!isThrown && !isLanded)
        {
            randomNumber = Random.Range(1, 7); // should be sent from server

            DiceRolling();

            ThrowDice(randomNumber);
        }
        else if (isThrown && isLanded)
        {
            ResetDice();
        }        
    }

    /// <summary>
    /// Throws dice with torque value depending on randomNumber
    /// </summary>
    /// <param name="randomNumber">Number from server that determines torque</param>
    private void ThrowDice(int randomNumber)
    {
        isThrown = true;
        rigidbody.useGravity = true;

        int count = sideTorqueValusePair[randomNumber].Count;
        int index = Random.Range(0, count);

        torque = sideTorqueValusePair[randomNumber][index];        
        rigidbody.AddTorque(torque);
    }


    /// <summary>
    /// Get dice back to its initial position and sets rigidbody properties
    /// </summary>
    private void ResetDice()
    {
        transform.rotation = initialRotation;
        transform.position = initPosition;

        isThrown = false;
        isLanded = false;

        rigidbody.useGravity = false;
        rigidbody.isKinematic = false;
    }

    /// <summary>
    /// Rolls dice again that is resets its initial position and throws
    /// </summary>
    private void RollAgain()
    {
        ResetDice();
        ThrowDice(randomNumber);
    }

    /// <summary>
    /// Checks grounded side and its value
    /// </summary>
    private void CheckSideValue()
    {
        diceValue = 0;

        foreach (DiceSide side in diceSides)
        {
            if (side.IsOnGround)
            {
                diceValue = side.SideValue;
            }
        }

        if (diceValue != 0)
        {
            //Record new values for torque

            //if (!sideTorqueValusePair.ContainsKey(diceValue))
            //{
            //    sideTorqueValusePair.Add(diceValue, new List<Vector3>());
            //}

            //sideTorqueValusePair[diceValue].Add(torque);

            //JsonHelper.SaveJson(path, ref sideTorqueValusePair);

            DiceRolled(diceValue);
        }
    }
}
