
Feature: Config Service

  @component
  Scenario: Dynamic Event Tag
  When I GET the cbaas product config with docs
  #Given I add an event with an id of "TEST6" and alias of "TEST6" and a datatype of "string"
  Given I add an event having id as "TEST6" and alias of "TEST6" and dataType of "string"
  When I PUT to the service
  Then the request succeeds
  When I GET the cbaas product config with docs
  Then the variant content changes have been persisted