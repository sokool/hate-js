<?php
/**
 * Created by PhpStorm.
 * User: sokool
 * Date: 21.01.15
 * Time: 16:08
 */

namespace MintSoft\HateJS;

use Zend\ModuleManager\Feature\ServiceProviderInterface;

class Module implements ServiceProviderInterface
{
    public function getConfig()
    {
        return include __DIR__ . '../../../config/module.config.php';
    }

    public function getServiceConfig()
    {
        return include __DIR__ . '/../../../config/service.config.php';
    }

    public function getAutoloaderConfig()
    {
        return array(
            'Zend\Loader\StandardAutoloader' => array(
                'namespaces' => array(
                    __NAMESPACE__ => __DIR__ . '/src/MintSoft/HateJS',
                ),
            ),
        );
    }
}