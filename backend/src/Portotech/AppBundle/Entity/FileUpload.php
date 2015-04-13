<?php
/**
 * Created by PhpStorm.
 * User: usr88
 * Date: 13/04/15
 * Time: 11:33
 */

namespace Portotech\AppBundle\Entity;


use Symfony\Component\HttpFoundation\File\UploadedFile;

class FileUpload {

    private $file;
    private $fileName;
    private $sentimentScale;

    /**
     * Sets file.
     *
     * @param UploadedFile $file
     */
    public function setFile(UploadedFile $file = null)
    {
        $this->file = $file;
        $this->fileName = md5(uniqid(rand(), true));
        $this->sentimentScale = array();
    }

    /**
     * Get file.
     *
     * @return UploadedFile
     */
    public function getFile()
    {
        return $this->file;
    }

    /**
     * @return mixed
     */
    public function getFileName()
    {
        return $this->fileName;
    }

    /**
     * @param mixed $fileName
     */
    public function setFileName($fileName)
    {
        $this->fileName = $fileName;
    }

    public function upload() {
        $this->getFile()->move($this->getUploadRootDir(), $this->getFileName());
        $this->setSentimentScale();
    }

    protected function getUploadRootDir()
    {
        return __DIR__.'/../../../../web/'.$this->getUploadDir();
    }

    protected function getUploadDir()
    {
        return 'upload';
    }

    protected function setSentimentScale() {
        //Abre o arquivo para leitura
        $file = fopen($this->getUploadRootDir().'/'.$this->getFileName(), 'r');

        //Lê a primeira linha do arquivo (ignorando o cabeçalho)
        fgetcsv($file);

        //Enquanto não encontrar o final do arquivo continua lendo
        while(!feof($file)){

            $line = fgetcsv($file, 0, "\t");

            if( !in_array($line[8], $this->sentimentScale) )
                $this->sentimentScale[] = $line[8];

        }

        fclose($file);
    }

    public function getSentimentScale() {
        return $this->sentimentScale;
    }
}