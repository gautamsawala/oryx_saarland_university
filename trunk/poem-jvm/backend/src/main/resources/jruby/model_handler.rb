module Handler
  class ModelHandler < DefaultHandler
    def doGet(interaction)
      representation = interaction.object.read
      interaction.response.setStatus(200)
      out = interaction.response.getWriter

      out.println("<?xml version=\"1.0\" encoding=\"utf-8\"?>\n")
    	out.println("<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Strict//EN\" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd\">")
    	out.println("<html xmlns=\"http://www.w3.org/1999/xhtml\"\n")
    	out.println(" xmlns:b3mn=\"http://b3mn.org/2007/b3mn\"\n")
    	out.println("xmlns:ext=\"http://b3mn.org/2007/ext\"\n")
    	out.println("xmlns:rdf=\"http://www.w3.org/1999/02/22-rdf-syntax-ns#\"\n")
    	out.println("xmlns:atom=\"http://b3mn.org/2007/atom+xhtml\">\n")

    	out.println("<head profile=\"http://purl.org/NET/erdf/profile\">\n")
    	out.println("<title>" + representation.getTitle + " - Oryx</title>\n")

    	out.println("<!-- libraries -->\n")
    	out.println("<script src=\"" + interaction.hostname + "/lib/prototype-1.5.1_rc3.js\" type=\"text/javascript\" />\n")
    	out.println("<script src=\"" + interaction.hostname + "/lib/path_parser.js\" type=\"text/javascript\" />\n")
    	out.println("<script src=\"" + interaction.hostname + "/lib/ext-1.0/adapter/yui/yui-utilities.js\" type=\"text/javascript\" />\n")
    	out.println("<script src=\"" + interaction.hostname + "/lib/ext-1.0/adapter/yui/ext-yui-adapter.js\" type=\"text/javascript\" />\n")
    	out.println("<script src=\"" + interaction.hostname + "/lib/ext-1.0/ext-all-debug.js\" type=\"text/javascript\" />\n")
    	out.println("<script src=\"" + interaction.hostname + "/lib/ext-1.0/ColorField.js\" type=\"text/javascript\" />\n")
    	out.println("<style media=\"screen\" type=\"text/css\">\n")
    	out.println("@import url(\"" + interaction.hostname + "/lib/ext-1.0/resources/css/ext-all.css\");\n")
    	out.println("@import url(\"" + interaction.hostname + "/lib/ext-1.0/resources/css/ytheme-gray.css\");\n")
    	out.println("</style>\n")

    	out.println("<script src=\"" + interaction.hostname + "/shared/kickstart.js\" type=\"text/javascript\" />\n")
    	out.println("<script src=\"" + interaction.hostname + "/shared/erdfparser.js\" type=\"text/javascript\" />\n")
    	out.println("<script src=\"" + interaction.hostname + "/shared/datamanager.js\" type=\"text/javascript\" />\n")

    	out.println("<!-- oryx editor -->\n")
    	out.println("<script src=\"" + interaction.hostname + "/oryx.js\" type=\"text/javascript\" />\n")
    	out.println("<link rel=\"Stylesheet\" media=\"screen\" href=\"" + interaction.hostname + "/css/theme_norm.css\" type=\"text/css\" />\n")

    	out.println("<!-- erdf schemas -->\n")
    	out.println("<link rel=\"schema.dc\" href=\"http://purl.org/dc/elements/1.1/\" />\n")
    	out.println("<link rel=\"schema.dcTerms\" href=\"http://purl.org/dc/terms/\" />\n")
    	out.println("<link rel=\"schema.b3mn\" href=\"http://b3mn.org\" />\n")
    	out.println("<link rel=\"schema.oryx\" href=\"http://oryx-editor.org/\" />\n")
    	out.println("<link rel=\"schema.raziel\" href=\"http://raziel.org/\" />\n")

    	out.println("<meta name=\"oryx.type\" content=\"http://b3mn.org/stencilset/bpmn#BPMNDiagram\" />\n")
    	out.println("</head>\n")
    	out.println("<body>\n")
      out.println(representation.getContent)
      out.println("</body>\n")
    	out.println("</html>\n")
    end

    def doPut(interaction)
      representation = interaction.object.read
      representation.setContent(params[data])
      representation.update
      interaction.response.setStatus(200)
    end

    def doPost(interaction)
      representation = interaction.object.read
      representation.setContent(params[data])
      representation.update
      interaction.response.setStatus(200)
    end
    
    def doDelete(interaction)
      interaction.object.delete
      interaction.response.setStatus(200)
    end
  end
end