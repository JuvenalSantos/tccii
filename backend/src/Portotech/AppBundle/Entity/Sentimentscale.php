<?php

namespace Portotech\AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * Sentimentscale
 *
 * @ORM\Table(name="SentimentScale", uniqueConstraints={@ORM\UniqueConstraint(name="sentiment_UNIQUE", columns={"sentiment", "Visualization_id"}), @ORM\UniqueConstraint(name="description_UNIQUE", columns={"description", "Visualization_id"})}, indexes={@ORM\Index(name="fk_SentimentScale_Visualization1_idx", columns={"Visualization_id"})})
 * @ORM\Entity(repositoryClass="Portotech\AppBundle\Repository\SentimentscaleRepository")
 */
class Sentimentscale
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
     * @var boolean
     *
     * @ORM\Column(name="sentiment", type="boolean", precision=0, scale=0, nullable=false, unique=false)
     */
    private $sentiment;

    /**
     * @var string
     *
     * @ORM\Column(name="description", type="string", length=45, precision=0, scale=0, nullable=false, unique=false)
     */
    private $description;

    /**
     * @var \Portotech\AppBundle\Entity\Visualization
     *
     * @ORM\ManyToOne(targetEntity="Portotech\AppBundle\Entity\Visualization")
     * @ORM\JoinColumns({
     *   @ORM\JoinColumn(name="Visualization_id", referencedColumnName="id", nullable=true)
     * })
     */
    private $visualization;



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
     * Set sentiment
     *
     * @param boolean $sentiment
     * @return Sentimentscale
     */
    public function setSentiment($sentiment)
    {
        $this->sentiment = $sentiment;

        return $this;
    }

    /**
     * Get sentiment
     *
     * @return boolean 
     */
    public function getSentiment()
    {
        return $this->sentiment;
    }

    /**
     * Set description
     *
     * @param string $description
     * @return Sentimentscale
     */
    public function setDescription($description)
    {
        $this->description = $description;

        return $this;
    }

    /**
     * Get description
     *
     * @return string 
     */
    public function getDescription()
    {
        return $this->description;
    }

    /**
     * Set visualization
     *
     * @param \Portotech\AppBundle\Entity\Visualization $visualization
     * @return Sentimentscale
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
