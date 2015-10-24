var _ = require('underscore');
var React = require('react');
var Select = require('react-select');
var Dropzone = require('react-dropzone');
var apiRequests = require('../utils/api-requests');

var SubmitForm = React.createClass({

  getInitialState: function () {
    var date = new Date();
    var now = date.getTime();

    return {
      data: {
        name: 'Test ' + now,
        shortDescription: 'Example',
        websiteUrl: 'http://www.example.com/',
        repoUrl: 'http://www.anotherexample.com/repo',
        description: 'Full description here..',
        cover: null,
        tags: []
      },
      tags: [],
      selectedTags: [],
      success: false,
      errors: false,
      loading: false,
      submitDisabled: false
    };
  },

  componentWillMount: function() {
    var flattenTags = [];
    var tagsJson = JSON.parse(this.props.tags);
     _.map(tagsJson, function (tag) {
      flattenTags.push({
        value: tag.pk,
        label: tag.fields.name
      });
    });
    this.setState({
      tags: flattenTags
    });
  },

  handleChange: function (key, event) {
    var state = {};
    var data = this.state.data;
    data[key] = event.target.value;
    this.setState({
      data: data
    });
  },

  onDrop: function (files) {
    var data = this.state.data;
    data.cover = files[0];
    this.setState({
      data: data
    });
  },

  onOpenClick: function () {
    this.refs.dropzone.open();
  },

  tagRenderer: function (option) {
    return <span key={option.pk}>{option.label}</span>
  },

  tagValue: function (option) {
		return <strong>{option.label}</strong>;
	},

  tagsSelected: function (val, selectedOptions) {
    var selectedTags = [];

    _.each(selectedOptions, function (tag) {
      selectedTags.push(tag.value);
    });

    var data = this.state.data;
    data.tags = selectedTags;

    this.setState({
      data: data,
      selectedTags: selectedOptions
    });
  },

  submitForm: function (e) {
    e.preventDefault();
    var self = this;

    this.setState({
      success: false,
      loading: true,
      submitDisabled: true
    });

    apiRequests
      .post('http://0.0.0.0:8000/api/directory/submit/', this.state.data, this.props.csrfToken)
      .end(function (err, response) {
        if (response && response.ok) {
          self.setState({
            success: true,
            errors: [],
            loading: false,
            submitDisabled: false
          });
        } else {
          self.setState({
            errors: response.body,
            loading: false,
            submitDisabled: false
          });
        }
      });
  },

  render: function () {
    return (
      <div className='submit-form'>
        <form className='form'>
          <div className={this.state.errors['name'] ? 'form-group has-error' : 'form-group'}>
            <label htmlFor='name' className='control-label'>Application Name <span className='required'>*</span></label>
            <input type='text' id='name' className='form-control input-lg' value={this.state.data.name} onChange={this.handleChange.bind(this, 'name')} />
          </div>
          <div className={this.state.errors['short_description'] ? 'form-group has-error' : 'form-group'}>
            <label htmlFor='shortDescription' className='control-label'>Short Description <span className='required'>*</span></label>
            <input type='text' id='shortDescription' className='form-control input-lg' value={this.state.data.shortDescription} onChange={this.handleChange.bind(this, 'shortDescription')} />
          </div>
          <div className={this.state.errors['website_url'] ? 'form-group has-error' : 'form-group'}>
            <label htmlFor='websiteUrl' className='control-label'>Website Url <span className='required'>*</span></label>
            <input type='text' id='websiteUrl' className='form-control input-lg' value={this.state.data.websiteUrl} onChange={this.handleChange.bind(this, 'websiteUrl')} />
          </div>
          <div className={this.state.errors['repo_url'] ? 'form-group has-error' : 'form-group'}>
            <label htmlFor='repoUrl'>Repository Url</label>
            <input type='text' id='repoUrl' className='form-control input-lg' value={this.state.data.repoUrl} onChange={this.handleChange.bind(this, 'repoUrl')} />
          </div>

          <label>Tags</label>
          <Select
            name="form-field-name"
            value={this.state.selectedTags}
            options={this.state.tags}
            onChange={this.tagsSelected}
            optionRenderer={this.tagRenderer}
            valueRenderer={this.tagValue}
            multi={true}
            placeholder='Enter your tags' />

          <label>Photo/Screenshot</label>
          <Dropzone ref='dropzone' className='dropzone' onDrop={this.onDrop} disableClick={true} multiple={false} activeClassName='active'>
            {this.state.data.cover ? (
              <div>
                <i className='fa fa-check-circle' />
                <div className='filename'>{this.state.data.cover.name}</div>
              </div>) : (
              <div>
                <h4 className='text-center'>drop your awesome image here</h4>
                <a className='btn btn-primary' onClick={this.onOpenClick}>Upload your image</a>
              </div>
            )}
          </Dropzone>

          <div className={this.state.errors['description'] ? 'form-group has-error' : 'form-group'}>
            <label htmlFor='description'>Description</label>
            <textarea className='form-control input-lg' id='description' rows='4' value={this.state.data.description} onChange={this.handleChange.bind(this, 'description')}></textarea>
          </div>

          {this.state.success ? (
            <div className='alert alert-success'>Submiited successfully! You will receive an email once it gets approved.</div>
          ): null}

          {_.isEmpty(this.state.errors) ? null : (
            <div className='alert alert-danger'>Oops! Please complete all the required fields and submit your applications.</div>
          )}
          <button className='btn btn-primary btn-lg btn-block' disabled={this.state.submitDisabled} onClick={this.submitForm}>Submit Entry</button>
        </form>
      </div>
    );
  }
});

module.exports = SubmitForm;