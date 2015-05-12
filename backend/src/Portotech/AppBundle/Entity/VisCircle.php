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
    private $tweetCircles;

    function __construct(Visualization $visualization)
    {
        $this->visualization = $visualization;
        $this->circles = array();
        $this->tweetCircles = array();
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
    public function getTweetCircles()
    {
        return $this->tweetCircles;
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
    public function setTweetCircles($tweets)
    {
        $points = array();
        foreach($tweets as $tweet) {
            $points[] = array(
                'subject' => $tweet['subject'],
                'sentiment' => (int) $tweet['sentiment'],
                'retweets' => (int) $tweet['retweets'],
                'tweet' => $tweet['tweet_text']
            );
        }
        $this->tweetCircles = $points;
    }
}