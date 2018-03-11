using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Player : MonoBehaviour
{
    public int Id { get; private set; } = 0; // TODO: temporary workaround

    [SerializeField] private float initialStep = 7;
    [SerializeField] private float step = 5;
    [SerializeField] private float speed = 10;
    [SerializeField] private float delayBeforeMove = 0.5f;
    [SerializeField] private float delayBetweenSteps = 0.6f;

    private Vector3 movementDirection = Vector3.forward;
    private int currentStepIndex = 1;
    

    private List<Vector3> possibleSpots = new List<Vector3>(Field.CORNERS_AMOUNT * (Field.STEPS_PER_CORNER + 1));

    private void Awake()
    {
        FillPossiblePositions();
    }

    void Start()
    {
        GameManager.Instance.Registrate(this);
    }

    /// <summary>
    /// Adds all possible positions to possibleSpots list
    /// </summary>
    private void FillPossiblePositions()
    {
        possibleSpots.Add(transform.position);

        for (int i = 0, ind = 1; i < Field.CORNERS_AMOUNT; i++)
        {
            for (int j = 0; j <= Field.STEPS_PER_CORNER; j++, ind++)
            {
                if (i == Field.CORNERS_AMOUNT - 1 && j == Field.STEPS_PER_CORNER) break;

                if (j == 0 || j == Field.STEPS_PER_CORNER)
                {
                    possibleSpots.Add(possibleSpots[ind - 1] + movementDirection * initialStep);
                }
                else
                {
                    possibleSpots.Add(possibleSpots[ind - 1] + movementDirection * step);
                }
            }

            if (i == 0) movementDirection = Vector3.left;
            else if (i == 1) movementDirection = Vector3.back;
            else movementDirection = Vector3.right;
        }
    }

    public void Move(int stepsToMove)
    {
        StartCoroutine(MoveThroughPositions(stepsToMove));
    }

    /// <summary>
    /// Iterates throught all possible positions and moves Player to possible position stepsToMove times
    /// </summary>
    /// <param name="stepsToMove">Amount of steps to move</param>
    /// <returns></returns>
    private IEnumerator MoveThroughPositions(int stepsToMove)
    {
        Debug.Log("Moving " + stepsToMove + " units");

        yield return new WaitForSeconds(delayBeforeMove); //TODO: temporary workaround bc it is freezing on start

        int bound = currentStepIndex + stepsToMove;

        for (int i = currentStepIndex; i < bound; i = ++i % possibleSpots.Count)
        {
            Vector3 initialPoition = transform.position;
            float fraction = speed * Time.deltaTime;

            while (fraction < 1)
            {
                transform.position = Vector3.Lerp(initialPoition, possibleSpots[i], fraction);                
                yield return null;
                fraction += speed * Time.deltaTime;
            }

            GenerateNextStepIndex(); // for keeping track of current position

            yield return new WaitForSeconds(delayBetweenSteps);
        }        
    }

    /// <summary>
    /// Increments currentStepIndex and calculates index of next player's step
    /// </summary>
    public void GenerateNextStepIndex()
    {
        currentStepIndex++;
        currentStepIndex %= possibleSpots.Count;
    }
}
