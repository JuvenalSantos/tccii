<?php

namespace Portotech\AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * Visualization
 *
 * @ORM\Table(name="Visualization", uniqueConstraints={@ORM\UniqueConstraint(name="name_UNIQUE", columns={"name"})})
 * @ORM\Entity(repositoryClass="Portotech\AppBundle\Repository\VisualizationRepository")
 */
class Visualization
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
     * @var string
     *
     * @ORM\Column(name="name", type="string", length=100, precision=0, scale=0, nullable=false, unique=false)
     */
    private $name;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="creat_at", type="datetime", precision=0, scale=0, nullable=false, unique=false)
     */
    private $creatAt;

    /**
     * @var string
     *
     * @ORM\Column(name="file", type="string", length=128, precision=0, scale=0, nullable=false, unique=false)
     */
    private $file;



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
     * Set name
     *
     * @param string $name
     * @return Visualization
     */
    public function setName($name)
    {
        $this->name = $name;

        return $this;
    }

    /**
     * Get name
     *
     * @return string 
     */
    public function getName()
    {
        return $this->name;
    }

    /**
     * Set creatAt
     *
     * @param \DateTime $creatAt
     * @return Visualization
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
     * Set file
     *
     * @param string $file
     * @return Visualization
     */
    public function setFile($file)
    {
        $this->file = $file;

        return $this;
    }

    /**
     * Get file
     *
     * @return string 
     */
    public function getFile()
    {
        return $this->file;
    }
}
