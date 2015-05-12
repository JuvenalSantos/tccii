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
    private $tCircles;

    function __construct(Visualization $visualization)
    {
        $this->visualization = $visualization;
        $this->circles = array();
        $this->tCircles = array();
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
     * @return array
     */
    public function getTCircles()
    {
        return $this->tCircles;
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
                'subject' => $tweet['subject'],
                'sentiment' => (int) $tweet['sentiment'],
                'total' => (int) $tweet['total'],
            );
        }
        $this->circles = $points;
    }

    /**
     * @param array $tCircles
     */
    public function setTCircles($tweets)
    {
        $points = array();
        foreach($tweets as $tweet) {
            $points[] = array(
                'subject' => $tweet['subject'],
                'sentiment' => (int) $tweet['sentiment'],
                'retweets' => (int) $tweet['retweets']
            );
        }
        $this->tCircles = $points;
    }
}