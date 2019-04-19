Feature: Config Service - Read

  @component
  Scenario Outline: Read all config docs
    When I GET all products
    Then the request succeeds
    Then the default products are shown
    And validate the JSON response object against the JSON schema <schemaFile>

    Examples:
      | productId | schemaFile |
      | cbaas     | products   |

  @component
  Scenario Outline: Read the <productId> product config doc
    When I GET the <productId> product config
    Then the request succeeds
    Then the <productId> product is shown
    And there are <variantLength> variants for the <productId> product
    And validate the JSON response object against the JSON schema <schemaFile1>
    When I GET the <productId> product config with docs
    Then the request succeeds
    Then the <productId> product is shown
    And there are <variantLength> variants for the <productId> product
    And validate the JSON response object against the JSON schema <schemaFile2>

    Examples:
      | productId | variantLength | schemaFile1 | schemaFile2     |
      | cbaas     | 2             | product     | productWithDocs |
      | demo      | 1             | product     | productWithDocs |
      | dev       | 1             | product     | productWithDocs |

  @component
  Scenario Outline: Read a product config that doesn't exist
    When I GET the <productId> product config
    Then I am informed <productId> product config is not found

    Examples:
      | productId |
      | wibble    |

  @component
  Scenario Outline: Read the <productId> product's <variantId> variant config doc
    When I GET the <productId> products <variantId> variant config
    Then the request succeeds
    And validate the JSON response object against the JSON schema <schemaFile>

    Examples:
      | productId | variantId | schemaFile |
      | cbaas     | default   | variant    |
      | cbaas     | ayy       | variant    |
      | dev       | default   | variant    |
      | demo      | default   | variant    |


  @component
  Scenario Outline: Read a variant product config that doesn't exist
    When I GET the <productId> products <variantId> variant config
    Then I am informed variant <variantId> product config is not found

    Examples:
      | productId | variantId |
      | cbaas     | wibble    |

