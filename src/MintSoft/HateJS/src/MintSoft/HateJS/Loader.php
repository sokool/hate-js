<?php
/**
 * Created by PhpStorm.
 * User: sokool
 * Date: 22.01.15
 * Time: 14:50
 */

namespace MintSoft\HateJS;

use Zend\EventManager\EventManagerInterface;
use Zend\EventManager\ListenerAggregateInterface;
use Zend\EventManager\ListenerAggregateTrait;
use Zend\Mvc\MvcEvent;
use Zend\View\Helper\HeadScript;

class Loader implements ListenerAggregateInterface
{
    use ListenerAggregateTrait;

    const HATE_JS_LOCATION = 'public/scripts/jquery.hate_js.js';

    public function attach(EventManagerInterface $events)
    {
        $this->listeners[] = $events->attach(MvcEvent::EVENT_RENDER, array($this, 'injectHateJSFile'));
    }

    public function injectHateJSFile(MvcEvent $event)
    {
        /** @var $headScript HeadScript */
        $headScript = $event->getApplication()->getServiceManager()->get('ViewHelperManager')->get('headScript');
        if (!file_exists(self::HATE_JS_LOCATION) && is_writable(dirname(self::HATE_JS_LOCATION))) {
            echo 'kopiujesz i ładujesz';
            exit;
            //$headScript->appendFile('scripts/jquery.application_client.js');
        } else {
            $headScript->appendScript(file_get_contents(__DIR__ . '/../../jquery.application_client.js'));
        }
    }
}