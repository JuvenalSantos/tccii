<?php

namespace Portotech\AppBundle\Entity;


class VisBubble {

    /**
     * @var \Portotech\AppBundle\Entity\Visualization
     */
    private $visualization;

    /**
     * @var array
     */
    private $bubbles;

    function __construct(Visualization $visualization)
    {
        $this->visualization = $visualization;
        $this->bubbles = array();
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
    public function getBubbles()
    {
        return $this->bubbles;
    }

    /**
     * @param array $bubbles
     */
    public function setBubbles($tweets)
    {
        $points = array();
        foreach($tweets as $tweet) {
            $points[] = array(
                'id' =>  $tweet['tweet_id'],
                'creat_at' => $tweet['creat_at'],
                'retweets' => (int)$tweet['retweets'],
                'sentiment' => (int)$tweet['sentiment']
            );
        }
        $this->bubbles = $points;
    }

}