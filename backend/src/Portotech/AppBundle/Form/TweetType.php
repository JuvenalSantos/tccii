<?php

namespace Portotech\AppBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolverInterface;

class TweetType extends AbstractType
{
    /**
     * @param FormBuilderInterface $builder
     * @param array $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('tweetId')
            ->add('tweetText')
            ->add('user')
            ->add('retweets')
            ->add('words')
            ->add('creatAt')
            ->add('hashtags')
            ->add('subject')
            ->add('sentiment')
            ->add('visualization')
        ;
    }
    
    /**
     * @param OptionsResolverInterface $resolver
     */
    public function setDefaultOptions(OptionsResolverInterface $resolver)
    {
        $resolver->setDefaults(array(
            'data_class' => 'Portotech\AppBundle\Entity\Tweet'
        ));
    }

    /**
     * @return string
     */
    public function getName()
    {
        return 'portotech_appbundle_tweet';
    }
}
