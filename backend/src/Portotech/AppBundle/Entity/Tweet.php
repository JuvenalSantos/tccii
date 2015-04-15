<?php

namespace Portotech\AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use JMS\Serializer\Annotation\Groups;

/**
 * Tweet
 *
 * @ORM\Table(name="Tweet", indexes={@ORM\Index(name="fk_Tweet_Visualization_idx", columns={"Visualization_id"})})
 * @ORM\Entity(repositoryClass="Portotech\AppBundle\Repository\TweetRepository")
 */
class Tweet
{
    /**
     * @var integer
     *
     * @ORM\Column(name="id", type="integer", precision=0, scale=0, nullable=false, unique=false)
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="IDENTITY")
     */
    private $id;

    /**
     * @var integer
     *
     * @ORM\Column(name="tweet_id", type="string", length=20, precision=0, scale=0, nullable=false, unique=false)
     */
    private $tweetId;

    /**
     * @var string
     *
     * @ORM\Column(name="tweet_text", type="string", length=255, precision=0, scale=0, nullable=false, unique=false)
     */
    private $tweetText;

    /**
     * @var string
     *
     * @ORM\Column(name="user", type="string", length=128, precision=0, scale=0, nullable=false, unique=false)
     */
    private $user;

    /**
     * @var integer
     *
     * @ORM\Column(name="retweets", type="integer", precision=0, scale=0, nullable=false, unique=false)
     */
    private $retweets;

    /**
     * @var string
     *
     * @ORM\Column(name="words", type="text", precision=0, scale=0, nullable=false, unique=false)
     */
    private $words;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="creat_at", type="datetime", precision=0, scale=0, nullable=false, unique=false)
     */
    private $creatAt;

    /**
     * @var string
     *
     * @ORM\Column(name="hashtags", type="text", precision=0, scale=0, nullable=false, unique=false)
     */
    private $hashtags;

    /**
     * @var string
     *
     * @ORM\Column(name="subject", type="string", length=255, precision=0, scale=0, nullable=false, unique=false)
     */
    private $subject;

    /**
     * @var boolean
     *
     * @ORM\Column(name="sentiment", type="integer", precision=0, scale=0, nullable=false, unique=false)
     */
    private $sentiment;

    /**
     * @var \Portotech\AppBundle\Entity\Visualization
     *
     * @ORM\ManyToOne(targetEntity="Portotech\AppBundle\Entity\Visualization")
     * @ORM\JoinColumns({
     *   @ORM\JoinColumn(name="Visualization_id", referencedColumnName="id", nullable=true)
     * })
     *
     * @Groups({"restrict"})
     */
    private $visualization;


    private $sentiments;


    /**
     * Get id
     *
     * @return integer 
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * Set tweetId
     *
     * @param string $tweetId
     * @return Tweet
     */
    public function setTweetId($tweetId)
    {
        $this->tweetId = $tweetId;

        return $this;
    }

    /**
     * Get tweetId
     *
     * @return string
     */
    public function getTweetId()
    {
        return $this->tweetId;
    }

    /**
     * Set tweetText
     *
     * @param string $tweetText
     * @return Tweet
     */
    public function setTweetText($tweetText)
    {
        $this->tweetText = $tweetText;

        return $this;
    }

    /**
     * Get tweetText
     *
     * @return string 
     */
    public function getTweetText()
    {
        return $this->tweetText;
    }

    /**
     * Set user
     *
     * @param string $user
     * @return Tweet
     */
    public function setUser($user)
    {
        $this->user = $user;

        return $this;
    }

    /**
     * Get user
     *
     * @return string 
     */
    public function getUser()
    {
        return $this->user;
    }

    /**
     * Set retweets
     *
     * @param integer $retweets
     * @return Tweet
     */
    public function setRetweets($retweets)
    {
        $this->retweets = $retweets;

        return $this;
    }

    /**
     * Get retweets
     *
     * @return integer 
     */
    public function getRetweets()
    {
        return $this->retweets;
    }

    /**
     * Set words
     *
     * @param string $words
     * @return Tweet
     */
    public function setWords($words)
    {
        $this->words = $words;

        return $this;
    }

    /**
     * Get words
     *
     * @return string 
     */
    public function getWords()
    {
        return $this->words;
    }

    /**
     * Set creatAt
     *
     * @param \DateTime $creatAt
     * @return Tweet
     */
    public function setCreatAt($creatAt)
    {
        $this->creatAt = $creatAt;

        return $this;
    }

    /**
     * Get creatAt
     *
     * @return \DateTime 
     */
    public function getCreatAt()
    {
        return $this->creatAt;
    }

    /**
     * Set hashtags
     *
     * @param string $hashtags
     * @return Tweet
     */
    public function setHashtags($hashtags)
    {
        $this->hashtags = $hashtags;

        return $this;
    }

    /**
     * Get hashtags
     *
     * @return string 
     */
    public function getHashtags()
    {
        return $this->hashtags;
    }

    /**
     * Set subject
     *
     * @param string $subject
     * @return Tweet
     */
    public function setSubject($subject)
    {
        $this->subject = $subject;

        return $this;
    }

    /**
     * Get subject
     *
     * @return string 
     */
    public function getSubject()
    {
        return $this->subject;
    }

    /**
     * Set sentiment
     *
     * @param integer $sentiment
     * @return Tweet
     */
    public function setSentiment($sentiment)
    {
        $this->sentiment = $sentiment;

        return $this;
    }

    /**
     * Get sentiment
     *
     * @return integer
     */
    public function getSentiment()
    {
        return $this->sentiment;
    }

    /**
     * Set visualization
     *
     * @param \Portotech\AppBundle\Entity\Visualization $visualization
     * @return Tweet
     */
    public function setVisualization(\Portotech\AppBundle\Entity\Visualization $visualization = null)
    {
        $this->visualization = $visualization;

        return $this;
    }

    /**
     * Get visualization
     *
     * @return \Portotech\AppBundle\Entity\Visualization 
     */
    public function getVisualization()
    {
        return $this->visualization;
    }
}
