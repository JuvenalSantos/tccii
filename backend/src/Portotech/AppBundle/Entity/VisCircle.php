<?php

namespace Portotech\AppBundle\Entity;


class VisCircle {

    /**
     * @var \Portotech\AppBundle\Entity\Visualization
     */
    private $visualization;

    /**
     * @var array
     */
    private $circles;

    function __construct(Visualization $visualization)
    {
        $this->visualization = $visualization;
        $this->circles = array();
    }

    /**
     * @return Visualization
     */
    public function getVisualization()
    {
        return $this->visualization;
    }

    /**
     * @return array
     */
    public function getCircles()
    {
        return $this->circles;
    }

    /**
     * @param array $circles
     */
    public function setCircles($tweets)
    {
        $points = array();
        foreach($tweets as $tweet) {
            $points[] = array(
                'creat_at' => $tweet['creat_at'],
                'sentiment' => (int) $tweet['sentiment'],
                'total' => (int) $tweet['total'],
            );
        }
        $this->circles = $points;
    }
}