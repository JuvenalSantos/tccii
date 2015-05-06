<?php

namespace Portotech\AppBundle\Controller;

use Doctrine\Common\Util\Debug;
use Doctrine\DBAL\DBALException;
use PDOException;
use Portotech\AppBundle\Entity\FileUpload;
use Portotech\AppBundle\Entity\VisMultiLine;
use Portotech\AppBundle\Entity\VisSingleLine;
use Portotech\AppBundle\Form\FileUploadType;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Portotech\AppBundle\Entity\Visualization;
use Portotech\AppBundle\Form\VisualizationType;
use FOS\RestBundle\Controller\FOSRestController,
    FOS\RestBundle\View\View,
    FOS\RestBundle\View\ViewHandler,
    FOS\RestBundle\Controller\Annotations as Rest;
use Symfony\Component\HttpFoundation\Response;
use Nelmio\ApiDocBundle\Annotation\ApiDoc;
use FOS\RestBundle\Util\Codes;


/**
 * Visualization controller.
 *
 * @Route("/visualization")
 */
class VisualizationController extends FOSRestController
{

    /**
     * Lists all Visualization entities.
     *
     * @ApiDoc(
     *     section = "01 - Visualization",
     *     statusCodes={
     *         200="Returned when successful",
     *     }
     * )
     * @Rest\Get("", name="visualization")
     */
    public function indexAction()
    {
        $em = $this->getDoctrine()->getManager();

        $entities = $em->getRepository('PortotechAppBundle:Visualization')->findAllOrderByDesc();

        return $this->view($entities);
    }

    /**
     * Upload a new Visualization Data File.
     *
     * @ApiDoc(
     *     section = "01 - Visualization",
     *     statusCodes={
     *         200="Returned when successful",
     *     }
     * )
     * @Rest\Post("/uploadfile", name="visualization_uploadfile")
     */
    public function uploadAction(Request $request)
    {
        $entity = new FileUpload();
        $form =  $this->createForm(new FileUploadType(), $entity);
        $form->submit($request->files->all());

        if ($form->isValid()) {

            $entity->upload();

            $arr = array(
                'file' => $entity->getFileName(),
                'sentimentScale' => $entity->getSentimentScale()
            );

            return $this->view($arr, Codes::HTTP_CREATED);
        }

        return $this->view($form);
    }

    /**
     * Creates a new Visualization entity.
     *
     * @ApiDoc(
     *     section = "01 - Visualization",
     *     statusCodes={
     *         200="Returned when successful",
     *     }
     * )
     * @Rest\Post("", name="visualization_create")
     */
    public function createAction(Request $request)
    {
        $entity = new Visualization();
        $form = $this->createCreateForm($entity);
        $form->submit($request->request->all());

        $em = $this->getDoctrine()->getManager();
        $em->getConnection()->beginTransaction();

        try {
            if ($form->isValid()) {

                $em = $this->getDoctrine()->getManager();
                $em->persist($entity);
                $em->flush();

                $filePath = $this->container->getParameter('absolute_path_upload').'/'.$entity->getFile();

                $em->getRepository("PortotechAppBundle:Tweet")->loadDataFile($filePath, $entity->getId());

                $entity->setTotalTweets($em->getRepository("PortotechAppBundle:Tweet")->countTweetsByVisualization($entity->getId()));
                $em->flush();

                $em->getConnection()->commit();

                return $this->view(Codes::HTTP_CREATED);
            }
        }
        catch (DBALException $e) {
            $em->getConnection()->rollback();
            throw $this->createNotFoundException('O arquivo de dados apresenta inconsistências. Certifique-se de que o arquivo de dados atenda aos padrões exigidos e tente novamente.');
        }

        return $this->view($form);
    }

    /**
     * Creates a form to create a Visualization entity.
     *
     * @param Visualization $entity The entity
     *
     * @return \Symfony\Component\Form\Form The form
     */
    private function createCreateForm(Visualization $entity)
    {
        $form = $this->createForm(new VisualizationType(), $entity);

        return $form;
    }


    /**
     * Finds and displays a Visualization entity (Basic information).
     *
     * @ApiDoc(
     *     section = "01 - Visualization",
     *     statusCodes={
     *         200="Returned when successful",
     *     }
     * )
     * @Rest\Get("/{id}", name="visualization_show")
     */
    public function showAction($id)
    {
        $em = $this->getDoctrine()->getManager();

        $entity = $em->getRepository('PortotechAppBundle:Visualization')->find($id);

        if (!$entity) {
            throw $this->createNotFoundException('Unable to find Visualization entity.');
        }

        return $this->view($entity);
    }

    /**
     * Finds and displays a Visualization entity (Full information).
     *
     * @ApiDoc(
     *     section = "01 - Visualization",
     *     statusCodes={
     *         200="Returned when successful",
     *     }
     * )
     * @Rest\Get("/full/{id}/{aggregation}", name="visualization_show_full")
     */
    public function showFullAction($id, $aggregation)
    {
        $em = $this->getDoctrine()->getManager();

        $visualization = $em->getRepository('PortotechAppBundle:Visualization')->find($id);

        if (!$visualization) {
            throw $this->createNotFoundException('Unable to find Visualization entity.');
        }

        $visSingleLine = new VisSingleLine($visualization);

        switch($aggregation) {
            case '5m':
                $lines = $em->getRepository('PortotechAppBundle:Tweet')->findTweetsEachFiveMinutesByVisualization($id);
                break;

            case '10m':
                $lines = $em->getRepository('PortotechAppBundle:Tweet')->findTweetsEachTenMinutesByVisualization($id);
                break;

            case '15m':
                $lines = $em->getRepository('PortotechAppBundle:Tweet')->findTweetsEachFifteenMinutesByVisualization($id);
                break;

            case '30m':
                $lines = $em->getRepository('PortotechAppBundle:Tweet')->findTweetsEachThirtyMinutesByVisualization($id);
                break;

            default:
                throw $this->createNotFoundException('Unable to find aggregation parameter.');
        }

        $visSingleLine->setLines($lines);

        $cloudTags = $em->getRepository('PortotechAppBundle:Tweet')->findTweetsTagsByVisualization($id);
        $visSingleLine->setCloudTags($cloudTags);


        return $this->view($visSingleLine);
    }

    /**
     * Finds and displays a Visualization entity (MultiLine).
     *
     * @ApiDoc(
     *     section = "01 - Visualization",
     *     statusCodes={
     *         200="Returned when successful",
     *     }
     * )
     * @Rest\Get("/multiline/{id}/{aggregation}", name="visualization_show_multiline")
     */
    public function showVisualizationMultiLineAction($id, $aggregation)
    {
        $em = $this->getDoctrine()->getManager();

        $visualization = $em->getRepository('PortotechAppBundle:Visualization')->find($id);

        if (!$visualization) {
            throw $this->createNotFoundException('Unable to find Visualization entity.');
        }

        $visMultiLine = new VisMultiLine($visualization);

        switch($aggregation) {

            case '30m':
                $lines = $em->getRepository('PortotechAppBundle:Tweet')->findTweetsEachThirtyMinutesByVisualizationMultiLine($id);
                break;

            default:
                throw $this->createNotFoundException('Unable to find aggregation parameter.');
        }

        $visMultiLine->setLines($lines);

        $cloudTags = $em->getRepository('PortotechAppBundle:Tweet')->findTweetsTagsByVisualization($id);
        $visMultiLine->setCloudTags($cloudTags);


        return $this->view($visMultiLine);
    }

    /**
     * Edits an existing Visualization entity.
     *
     * @ApiDoc(
     *     section = "01 - Visualization",
     *     statusCodes={
     *         200="Returned when successful",
     *     }
     * )
     * @Rest\Put("{id}", name="visualization_update")
     */
    public function updateAction(Request $request, $id)
    {
        $em = $this->getDoctrine()->getManager();

        $entity = $em->getRepository('PortotechAppBundle:Visualization')->find($id);

        if (!$entity) {
            throw $this->createNotFoundException('Unable to find Visualization entity.');
        }

        $editForm = $this->createCreateForm($entity);
        $editForm->submit($request->request->all());

        if ($editForm->isValid()) {
            $em->flush();

            return $this->redirect(Codes::HTTP_NO_CONTENT);
        }

        return $this->view($editForm);
    }

    /**
     * Deletes a Visualization entity.
     *
     * @ApiDoc(
     *     section = "01 - Visualization",
     *     statusCodes={
     *         200="Returned when successful",
     *     }
     * )
     * @Rest\Delete("{id}", name="visualization_delete")
     */
    public function deleteAction(Request $request, $id)
    {
        $form = $this->createCreateForm($id);
        $form->submit($request->request->all());

        if ($form->isValid()) {
            $em = $this->getDoctrine()->getManager();
            $entity = $em->getRepository('PortotechAppBundle:Visualization')->find($id);

            if (!$entity) {
                throw $this->createNotFoundException('Unable to find Visualization entity.');
            }

            $em->remove($entity);
            $em->flush();
        }

        return $this->view(Codes::HTTP_NO_CONTENT);
    }

}
