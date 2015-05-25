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
    private $subjects;
    private $followersMinMax;

    function __construct(Visualization $visualization)
    {
        $this->visualization = $visualization;
        $this->circles = array();
        $this->tweetCircles = array();
        $this->subjects = array();
    }

    /**
     * @return mixed
     */
    public function getFollowersMinMax()
    {
        return $this->followersMinMax;
    }

    /**
     * @param mixed $followersMinMax
     */
    public function setFollowersMinMax($followersMinMax)
    {
        $this->followersMinMax = $followersMinMax;
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
     * @param array $tweets
     */
    public function setTweetCircles($tweets)
    {
        $points = array();
        foreach($tweets as $tweet) {
            $points[] = array(
                'subject' => $tweet['subject'],
                'sentiment' => (int) $tweet['sentiment'],
                'followers' => (int) $tweet['followers'],
                'tweet' => $tweet['tweet_text']
            );
        }
        $this->tweetCircles = $points;
    }

    /**
     * @param array $subjects
     */
    public function setSubjects($subjects){
        $this->subjects = $subjects;
    }

    /**
     * @return array
     */
    public function getSubjects()
    {
        return $this->subjects;
    }
}