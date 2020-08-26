 

## Hey Alexa, make my life easier

```bash
Alexa, play music.
Alexa, turn on lights.
Alexa, create Tanzu Cluster.
Alexa, run inspection on my cluster.
```

## Alexa, meet Tanzu Mission Control

This alexa skill interacts with TMC's APIs and makes cluster creation and management a piece of cake! 

Note - This started as a weekend project and turn out to be so much fun that I had to share it. The code is not for production, so don't look for edge cases :smiley: 

## Some basics first
This is a custom skill and comprises of:
* A set of _Intents_ that represent actions that your users can perform. _Example_ - Create Cluster, Upgrade Cluster
* A set of sample _Utterances_, that is, words or phrases users interacting with your skill may say to express intent. _Example_ - Create a cluster, Spin up a cluster, Give me a cluster
* _Invocation Name_ that identifies your skill. Users use the invocation name to interact with your skill.
* _Slots_ that are optional arguments and extracted from utterances. _Example_ - Create a cluster called Magic, Spin up a cluster called Demo.

## What's possible today

__*Create clusters*__ of course! 

You can ask alexa if upgrades are available for your cluster. And run inspections for now!

I will be adding more to it moving forward. Operations that can change the state of a cluster or delete one are not possible today - on purpose. 

How many times do you have to repeat yourself before alexa plays the right song for you? 

Alexa takes time to learn and this is not Frankestein! :smiling_imp: 

 
