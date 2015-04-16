<?php

namespace Portotech\AppBundle\Entity;


class VisSingleLine {

   /**
    * @var \Portotech\AppBundle\Entity\Visualization
    */
    private $visualization;

    /**
     * @var array
     */
    private $lines;

    function __construct(Visualization $visualization)
    {
        $this->visualization = $visualization;
    }


    /**
     * @return Visualization
     */
    public function getVisualization()
    {
        return $this->visualization;
    }

    /**
     * Set Lines
     *
     * @param array
     */
    public function setLines($lines){
        $points = array();
        foreach($lines as $point) {
            $points[] = array('creat_at' => $point['creat_at'], 'y' => $point['media']);
        }
        $this->lines = $points;
    }

    /**
     * Add Line
     *
     * @param array
     */
    public function addLine($line){
        $this->lines[] = $line;
    }

    /**
     * @return array
     */
    public function getLines()
    {
        return $this->lines;
    }

}