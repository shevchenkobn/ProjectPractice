using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Player : MonoBehaviour
{
    public static event System.Action Rotated = delegate { };

    public int Id { get; private set; } = 0; // TODO: temporary workaround

    [SerializeField] private float initialStep = 26;
    [SerializeField] private float step = 12.5f;
    [SerializeField] private float speed = 10;
    [SerializeField] private float delayBeforeMove = 0.5f;
    [SerializeField] private float delayBetweenSteps = 0.6f;

    private Vector3 cornerRotation = new Vector3(0, -90, 0);
    private Vector3 movementDirection = Vector3.forward;

    private Vector3 specialBuildingCurrentCorrection = new Vector3(-3f, 0, 0);
    private Vector3 specialBuildingNextCorrection = new Vector3(0, 0, 6f);

    private int currentStepIndex = 1;
    private int specialBuildingIndex = 20;

    private List<Vector3> possibleSpots = new List<Vector3>(Field.CORNERS_AMOUNT * (Field.STEPS_PER_CORNER + 1));

    private void Awake()
    {
        FillPossiblePositions();
    }

    private void OnEnable()
    {
        GameManager.GameManagerLoaded += OnGameManagerLoaded;
    }

    private void OnDisable()
    {
        GameManager.GameManagerLoaded -= OnGameManagerLoaded;
    }


    private void OnGameManagerLoaded()
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

        //workaround
        Vector3 previousPosition = possibleSpots[specialBuildingIndex - 1];
        Vector3 nextPosition = possibleSpots[specialBuildingIndex + 1];
        Vector3 newPosition = Vector3.Lerp(previousPosition, nextPosition, 0.5f);

        possibleSpots[specialBuildingIndex] = newPosition + specialBuildingCurrentCorrection;
        possibleSpots[specialBuildingIndex + 1] += specialBuildingNextCorrection;
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

        for (int i = currentStepIndex; stepsToMove > 0; i = ++i % possibleSpots.Count, stepsToMove--)
        {
            Vector3 initialPoition = transform.position;

            float fraction;

            //for steps on corners
            if (currentStepIndex % 10 == 1 || currentStepIndex % 10 == 0)
            {
                fraction = speed / 4f * Time.deltaTime;
            }
            else
            {
                fraction = speed * Time.deltaTime;
            }

            while (fraction < 1)
            {
                transform.position = Vector3.Lerp(initialPoition, possibleSpots[i], fraction);                
                yield return null;
                fraction += speed * Time.deltaTime;
            }

            // for rotation
            if (currentStepIndex % 10 == 0)
            {
                transform.Rotate(cornerRotation);
                Rotated();
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
