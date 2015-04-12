<?php

namespace Portotech\AppBundle\Controller;
use Doctrine\Common\Proxy\Exception\InvalidArgumentException;
use Symfony\Component\HttpFoundation\Request;
use FOS\RestBundle\Controller\FOSRestController,
    FOS\RestBundle\View\View,
    FOS\RestBundle\View\ViewHandler,
    FOS\RestBundle\Controller\Annotations\Get,
    FOS\RestBundle\Controller\Annotations\Route;
use Symfony\Component\HttpFoundation\Response;
use Nelmio\ApiDocBundle\Annotation\ApiDoc;
use Symfony\Component\HttpKernel\Exception\HttpException;


class PageController extends FOSRestController
{

    /**
     * @Get("/pages/{id}")
     * @ApiDoc(
     *     statusCodes={
     *         200="Returned when successful",
     *         403="Returned when the user is not authorized to say hello",
     *         404={
     *           "Returned when the user is not found",
     *           "Returned when something else is not found"
     *         }
     *     }
     * )
     */
    public function getPage(Request $request, $id)
    {
        $data = array('foo' => 'bar');
        $cat = $this->getDoctrine()->getRepository('PortotechAppBundle:CategoriaPessoa')->findAllOrderedByName();

        $view = $this->view($cat, 200);

        throw new HttpException(500);

        return $this->handleView($view);
    }

}
