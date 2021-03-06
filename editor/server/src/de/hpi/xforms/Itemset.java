package de.hpi.xforms;

import java.util.ArrayList;
import java.util.List;

/**
 * 
 * @author jan-felix.schwarz@student.hpi.uni-potsdam.de
 *
 */
public class Itemset extends ListUICommon implements UICommonContainer, LabelContainer {
	
	protected Help help;
	protected Hint hint;
	protected Alert alert;
	protected List<AbstractAction> actions;
	protected Label label;
	protected Value value;
	protected Copy copy;

	public Itemset() {
		super();
		attributes.put("nodeset", null);
		attributes.put("bind", null);
	}
	
	public Help getHelp() {
		return help;
	}

	public void setHelp(Help help) {
		this.help = help;
	}

	public Hint getHint() {
		return hint;
	}

	public void setHint(Hint hint) {
		this.hint = hint;
	}

	public Alert getAlert() {
		return alert;
	}

	public void setAlert(Alert alert) {
		this.alert = alert;
	}
	
	public List<AbstractAction> getActions() {
		if(actions==null)
			actions = new ArrayList<AbstractAction>();
		return actions;
	}

	public Label getLabel() {
		return label;
	}

	public void setLabel(Label label) {
		this.label = label;
	}
	
	public Value getValue() {
		return value;
	}

	public void setValue(Value value) {
		this.value = value;
	}
	
	public Copy getCopy() {
		return copy;
	}

	public void setCopy(Copy copy) {
		this.copy = copy;
	}
	
	@Override
	public String getStencilId() {
		return "Itemset";
	}
	
	@Override
	public String getTagName() {
		return "itemset";
	}

}
